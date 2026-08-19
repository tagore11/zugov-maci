import type {
  RuleDraft,
  RuleConfig,
  EligibilityMechanism,
  Erc20TokenConfig,
  TierConfig,
} from "@/src/services/eligibilityApi";

/** Only persisted tiers (a real server-assigned id) are selectable — a tier drafted in the same
 * edit session has no id yet, so it can't be targeted by a rule until it's actually saved. The
 * parent page is responsible for filtering to this shape. */
export interface TierOption {
  id: string;
  label: string;
}

interface Props {
  rules: RuleDraft[];
  tiers: TierOption[];
  onChange: (rules: RuleDraft[]) => void;
}

interface GroupView {
  index: number;
  targetTierId?: string;
  rules: RuleDraft[];
}

const MECHANISM_LABELS: Record<EligibilityMechanism, string> = {
  open: "Open (always eligible)",
  tier: "Already holds a tier",
  erc20_token: "ERC-20 token balance",
};

function groupRules(rules: RuleDraft[]): GroupView[] {
  const byIndex = new Map<number, RuleDraft[]>();
  for (const rule of rules) {
    const arr = byIndex.get(rule.groupIndex) ?? [];
    arr.push(rule);
    byIndex.set(rule.groupIndex, arr);
  }
  return [...byIndex.entries()]
    .sort(([a], [b]) => a - b)
    .map(([index, groupedRules]) => ({ index, targetTierId: groupedRules[0]?.targetTierId, rules: groupedRules }));
}

function defaultConfigFor(mechanism: EligibilityMechanism, tiers: TierOption[]): RuleConfig {
  switch (mechanism) {
    case "open":
      return {};
    case "tier":
      return { tierId: tiers[0]?.id ?? "" };
    case "erc20_token":
      return { chainId: 534351, tokenAddress: "", threshold: "0" };
  }
}

/** Controlled, no network calls — same pattern as TierEditor: the parent page owns fetching and
 * saving, this component only turns edits into a new `rules` array via onChange.
 *
 * Rules are edited grouped by groupIndex — groups are OR-ed together (DNF composition), rules
 * within a group are AND-ed. Each group has one "grants tier" picker, not one per rule: eligibil-
 * ityService.evaluateRuleset resolves a passing group's target tier from whichever of its rules
 * happens to come back first from the DB, so writing the SAME targetTierId onto every rule in a
 * group (done in emit()) is what keeps that read well-defined rather than leaving it to row order. */
export function EligibilityRulesetEditor({ rules, tiers, onChange }: Props) {
  const groups = groupRules(rules);

  function emit(nextGroups: GroupView[]) {
    // Renumber to the group's position (0..n-1) on every change — groupIndex is purely an
    // OR-partition key to the backend, not a stable id, so a removed group never leaves a gap.
    const flat: RuleDraft[] = [];
    nextGroups.forEach((group, index) => {
      for (const rule of group.rules) {
        flat.push({ ...rule, groupIndex: index, targetTierId: group.targetTierId });
      }
    });
    onChange(flat);
  }

  function addGroup() {
    emit([...groups, { index: groups.length, rules: [{ groupIndex: groups.length, mechanism: "open", config: {} }] }]);
  }

  function removeGroup(groupIdx: number) {
    emit(groups.filter((g) => g.index !== groupIdx));
  }

  function setGroupTargetTier(groupIdx: number, targetTierId: string) {
    emit(groups.map((g) => (g.index === groupIdx ? { ...g, targetTierId: targetTierId || undefined } : g)));
  }

  function addRuleToGroup(groupIdx: number) {
    emit(
      groups.map((g) =>
        g.index === groupIdx
          ? { ...g, rules: [...g.rules, { groupIndex: groupIdx, mechanism: "open", config: {} }] }
          : g,
      ),
    );
  }

  function removeRuleFromGroup(groupIdx: number, ruleIdx: number) {
    emit(groups.map((g) => (g.index === groupIdx ? { ...g, rules: g.rules.filter((_, i) => i !== ruleIdx) } : g)));
  }

  function updateRule(groupIdx: number, ruleIdx: number, patch: Partial<RuleDraft>) {
    emit(
      groups.map((g) =>
        g.index === groupIdx ? { ...g, rules: g.rules.map((r, i) => (i === ruleIdx ? { ...r, ...patch } : r)) } : g,
      ),
    );
  }

  function changeMechanism(groupIdx: number, ruleIdx: number, mechanism: EligibilityMechanism) {
    updateRule(groupIdx, ruleIdx, { mechanism, config: defaultConfigFor(mechanism, tiers) });
  }

  if (groups.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500">
          No eligibility rules configured — anyone can join, subject to the membership policy above.
        </p>
        <button type="button" onClick={addGroup} className="text-sm text-accent-hover hover:text-accent font-medium">
          + Add an eligibility rule
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group, gi) => (
        <div key={group.index}>
          {gi > 0 && (
            <div className="flex items-center gap-3 py-2">
              <div className="h-px flex-1 bg-gray-700" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Or</span>
              <div className="h-px flex-1 bg-gray-700" />
            </div>
          )}
          <div className="p-4 border-2 border-gray-700 rounded-lg space-y-3">
            {group.rules.map((rule, ri) => (
              <div key={ri}>
                {ri > 0 && <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-1">And</p>}
                <div className="flex flex-wrap items-start gap-2">
                  <select
                    value={rule.mechanism}
                    onChange={(e) => changeMechanism(group.index, ri, e.target.value as EligibilityMechanism)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 text-foreground rounded-lg text-sm"
                  >
                    {Object.entries(MECHANISM_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  {rule.mechanism === "tier" && (
                    <select
                      value={(rule.config as TierConfig).tierId}
                      onChange={(e) => updateRule(group.index, ri, { config: { tierId: e.target.value } })}
                      className="px-3 py-2 bg-gray-800 border border-gray-600 text-foreground rounded-lg text-sm"
                    >
                      {tiers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {rule.mechanism === "erc20_token" && (
                    <>
                      <input
                        type="text"
                        placeholder="0x… token address"
                        value={(rule.config as Erc20TokenConfig).tokenAddress}
                        onChange={(e) =>
                          updateRule(group.index, ri, {
                            config: { ...(rule.config as Erc20TokenConfig), tokenAddress: e.target.value },
                          })
                        }
                        className="px-3 py-2 bg-gray-800 border border-gray-600 text-foreground rounded-lg text-sm font-mono w-64"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Minimum balance"
                        value={(rule.config as Erc20TokenConfig).threshold}
                        onChange={(e) =>
                          updateRule(group.index, ri, {
                            config: {
                              ...(rule.config as Erc20TokenConfig),
                              threshold: e.target.value.replace(/[^0-9]/g, ""),
                            },
                          })
                        }
                        className="px-3 py-2 bg-gray-800 border border-gray-600 text-foreground rounded-lg text-sm w-40"
                      />
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => removeRuleFromGroup(group.index, ri)}
                    disabled={group.rules.length <= 1}
                    className="text-xs text-red-400 hover:text-red-300 disabled:opacity-30 px-2 py-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => addRuleToGroup(group.index)}
                className="text-xs text-accent-hover hover:text-accent font-medium"
              >
                + And another condition
              </button>

              <label className="flex items-center gap-2 text-xs text-gray-400">
                Grants tier
                <select
                  value={group.targetTierId ?? ""}
                  onChange={(e) => setGroupTargetTier(group.index, e.target.value)}
                  className="px-2 py-1 bg-gray-800 border border-gray-600 text-foreground rounded text-xs"
                >
                  <option value="">Community default</option>
                  {tiers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => removeGroup(group.index)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove this rule group
              </button>
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={addGroup} className="text-sm text-accent-hover hover:text-accent font-medium">
        + Add an alternate way to qualify (OR)
      </button>
    </div>
  );
}

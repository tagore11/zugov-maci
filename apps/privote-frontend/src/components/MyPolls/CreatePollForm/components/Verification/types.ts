import { PolicyConfigType } from '../../types';

export interface IPolicyConfigProps {
  config: PolicyConfigType;
  onConfigChange: (config: PolicyConfigType) => void;
}

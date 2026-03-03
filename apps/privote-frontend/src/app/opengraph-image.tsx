import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Privote - Private, Secure, and Verifiable Voting with MACI';
export const size = {
  width: 1200,
  height: 630
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          position: 'relative',
          background: '#0a0a0f',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Animated gradient background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 30%, rgba(127, 88, 183, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(198, 94, 198, 0.15) 0%, transparent 50%)',
            display: 'flex'
          }}
        />

        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            display: 'flex'
          }}
        />

        {/* Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            padding: '80px',
            position: 'relative',
            justifyContent: 'space-between'
          }}
        >
          {/* Top section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div
                style={{
                  fontSize: 80,
                  fontWeight: 400,
                  color: '#fff',
                  letterSpacing: '9.473px',
                  display: 'flex',
                  textTransform: 'uppercase'
                }}
              >
                PRI<span style={{ color: '#c45ec6' }}>VOTE</span>
              </div>
              <div style={{ width: '2px', height: '50px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '0.15em',
                  display: 'flex'
                }}
              >
                Privote.live
              </div>
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: 48,
                color: '#ffffff',
                fontWeight: 600,
                lineHeight: 1.2,
                maxWidth: '900px',
                display: 'flex',
                marginTop: '16px'
              }}
            >
              Private, Secure, and Verifiable Voting
            </div>

            <div
              style={{
                fontSize: 24,
                color: '#888',
                fontWeight: 400,
                display: 'flex'
              }}
            >
              Powered by MACI Protocol
            </div>
          </div>

          {/* Bottom section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Features */}
            <div
              style={{
                display: 'flex',
                gap: '60px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(127, 88, 183, 0.2) 0%, rgba(127, 88, 183, 0.1) 100%)',
                    border: '1px solid rgba(127, 88, 183, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22
                  }}
                >
                  🔒
                </div>
                <span style={{ fontSize: 28, color: '#fff', fontWeight: 500 }}>Private</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(198, 94, 198, 0.2) 0%, rgba(198, 94, 198, 0.1) 100%)',
                    border: '1px solid rgba(198, 94, 198, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22
                  }}
                >
                  🛡️
                </div>
                <span style={{ fontSize: 28, color: '#fff', fontWeight: 500 }}>Secure</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(127, 88, 183, 0.2) 0%, rgba(127, 88, 183, 0.1) 100%)',
                    border: '1px solid rgba(127, 88, 183, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22
                  }}
                >
                  ✔
                </div>
                <span style={{ fontSize: 28, color: '#fff', fontWeight: 500 }}>Verifiable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle at top right, rgba(198, 94, 198, 0.1) 0%, transparent 70%)',
            display: 'flex'
          }}
        />
      </div>
    ),
    {
      ...size
    }
  );
}

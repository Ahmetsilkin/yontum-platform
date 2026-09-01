import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#141414',
          borderRadius: 7,
        }}
      >
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            fontSize: 20,
            color: '#f7f3e8',
            lineHeight: 1,
          }}
        >
          Y
        </span>
      </div>
    ),
    { ...size }
  );
}

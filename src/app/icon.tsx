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
          background: '#121316',
          borderRadius: 7,
        }}
      >
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            fontSize: 20,
            color: '#FAFAF7',
            lineHeight: 1,
          }}
        >
          M
        </span>
      </div>
    ),
    { ...size }
  );
}

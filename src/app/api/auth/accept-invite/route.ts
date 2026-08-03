import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase-server';

const requestSchema = z.object({
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.headers
      .get('authorization')
      ?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json(
        { error: 'Davet anahtarı bulunamadı.' },
        { status: 401 }
      );
    }

    const { password } = requestSchema.parse(await request.json());
    const supabase = createServiceClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Davet bağlantısı geçersiz veya süresi dolmuş.' },
        { status: 401 }
      );
    }

    if (!user.user_metadata?.invited_staff) {
      return NextResponse.json(
        { error: 'Bu bağlantı geçerli bir çalışan daveti değil.' },
        { status: 403 }
      );
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        password,
        user_metadata: {
          ...user.user_metadata,
          invited_staff: false,
          password_set: true,
        },
      }
    );

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      email: user.email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            'Şifre en az 8 karakter olmalı; büyük harf, küçük harf ve rakam içermeli.',
        },
        { status: 400 }
      );
    }

    console.error('accept-invite error', error);

    return NextResponse.json(
      { error: 'Şifre oluşturulamadı.' },
      { status: 500 }
    );
  }
}

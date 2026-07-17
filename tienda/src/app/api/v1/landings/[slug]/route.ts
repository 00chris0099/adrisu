import { NextRequest } from 'next/server';

const WMS_INTERNAL_URL = process.env.WMS_INTERNAL_URL || 'http://localhost:3000';

interface Props {
  params: { slug: string };
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const res = await fetch(`${WMS_INTERNAL_URL}/api/v1/landings/${params.slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return Response.json({ success: true, data: null });
    }

    const data = await res.json();
    return Response.json({ success: true, data: data.data || null });
  } catch {
    return Response.json({ success: true, data: null });
  }
}

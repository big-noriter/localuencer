import { NextResponse } from 'next/server';
import { mockVlogs } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vlog = mockVlogs.find(vlog => vlog.id === params.id);
    
    if (!vlog) {
      return NextResponse.json(
        { error: 'Vlog not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(vlog);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

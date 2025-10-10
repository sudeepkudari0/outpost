import { type NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.LATE_API_KEY;
    const lateBase = process.env.NEXT_PUBLIC_LATE_BASE;

    if (!apiKey || !lateBase) {
      return NextResponse.json(
        { error: 'Late configuration missing' },
        { status: 500 }
      );
    }

    const response = await fetch(`${lateBase}/v1/drafts`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch drafts');
    }

    return NextResponse.json({
      drafts: data.drafts || [],
    });
  } catch (error) {
    console.error('Drafts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get('id');

    if (!draftId) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.LATE_API_KEY;
    const lateBase = process.env.NEXT_PUBLIC_LATE_BASE;

    if (!apiKey || !lateBase) {
      return NextResponse.json(
        { error: 'Late configuration missing' },
        { status: 500 }
      );
    }

    const response = await fetch(`${lateBase}/v1/drafts/${draftId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete draft');
    }

    return NextResponse.json({
      message: 'Draft deleted successfully',
    });
  } catch (error) {
    console.error('Draft delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}

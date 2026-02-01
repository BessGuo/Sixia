import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ContentBlock } from '@/lib/types';

// GET /api/notes - Get all notes for current user
export async function GET(request: NextRequest) {
  try {
    // Get userId from query param for now (TODO: use session/token)
    const { searchParams } = new URL(request.url);
    const userId =
      searchParams.get('userId') || request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    return NextResponse.json({ error: '获取笔记失败' }, { status: 500 });
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    // Get userId from header or query param for now
    const { searchParams } = new URL(request.url);
    const userId =
      searchParams.get('userId') || request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body as { content: ContentBlock[] };

    if (!content || !Array.isArray(content) || content.length === 0) {
      return NextResponse.json({ error: '笔记内容不能为空' }, { status: 400 });
    }

    // Validate content blocks
    const isValidContent = content.every(
      (block) =>
        (block.type === 'text' && typeof block.content === 'string') ||
        (block.type === 'image' && typeof block.src === 'string')
    );

    if (!isValidContent) {
      return NextResponse.json({ error: '无效的内容格式' }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        userId,
        content,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json({ error: '创建笔记失败' }, { status: 500 });
  }
}

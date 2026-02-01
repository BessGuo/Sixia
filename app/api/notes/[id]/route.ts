import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ContentBlock } from '@/lib/types';

// GET /api/notes/[id] - Get a single note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get userId from session/token
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const note = await prisma.note.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!note) {
      return NextResponse.json({ error: '笔记不存在' }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Get note error:', error);
    return NextResponse.json({ error: '获取笔记失败' }, { status: 500 });
  }
}

// PUT /api/notes/[id] - Update a note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get userId from session/token
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body as { content: ContentBlock[] };

    if (!content || !Array.isArray(content) || content.length === 0) {
      return NextResponse.json({ error: '笔记内容不能为空' }, { status: 400 });
    }

    // Verify note ownership
    const existingNote = await prisma.note.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existingNote) {
      return NextResponse.json({ error: '笔记不存在' }, { status: 404 });
    }

    const note = await prisma.note.update({
      where: { id: params.id },
      data: { content },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Update note error:', error);
    return NextResponse.json({ error: '更新笔记失败' }, { status: 500 });
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get userId from session/token
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // Verify note ownership
    const existingNote = await prisma.note.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existingNote) {
      return NextResponse.json({ error: '笔记不存在' }, { status: 404 });
    }

    await prisma.note.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json({ error: '删除笔记失败' }, { status: 500 });
  }
}

# 数据库表结构说明

## 表结构

### User 表（用户）

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // 加密后的密码
  name      String   // 用户昵称
  notes     Note[]   // 用户的笔记
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Note 表（笔记）

```prisma
model Note {
  id        String   @id @default(cuid())
  userId    String   // 关联用户ID
  user      User     @relation(...)
  content   Json     // 内容块数组
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

## ContentBlock 结构

笔记内容以 JSON 格式存储，支持以下类型：

### 文本块

```typescript
{
  type: 'text',
  content: 'string'  // 文本内容
}
```

### 图片块

```typescript
{
  type: 'image',
  src: 'string',        // 当前：Base64 或本地数据
  url?: 'string',       // 预留：OSS URL（后续集成）
  fileKey?: 'string'    // 预留：OSS 文件键（后续集成）
}
```

## API 接口

### 获取所有笔记

```
GET /api/notes
Headers: x-user-id: <user-id>
```

### 创建笔记

```
POST /api/notes
Headers: x-user-id: <user-id>
Body: {
  content: ContentBlock[]
}
```

### 获取单个笔记

```
GET /api/notes/:id
Headers: x-user-id: <user-id>
```

### 更新笔记

```
PUT /api/notes/:id
Headers: x-user-id: <user-id>
Body: {
  content: ContentBlock[]
}
```

### 删除笔记

```
DELETE /api/notes/:id
Headers: x-user-id: <user-id>
```

## 使用示例

### 前端调用示例

```typescript
// 创建笔记
const createNote = async (content: ContentBlock[]) => {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({ content }),
  });
  return response.json();
};

// 获取笔记列表
const getNotes = async () => {
  const response = await fetch('/api/notes', {
    headers: {
      'x-user-id': userId,
    },
  });
  return response.json();
};
```

## 后续 OSS 集成

当配置 OSS 后，图片块结构将扩展为：

```typescript
{
  type: 'image',
  src: 'data:image/png;base64,...',  // 上传前的临时数据
  url: 'https://oss.example.com/...',  // OSS URL
  fileKey: 'notes/2025/01/xxx.png'    // OSS 文件路径
}
```

迁移步骤：

1. 用户上传图片时先上传到 OSS
2. 获取 OSS URL 和 fileKey
3. 保存时包含 url 和 fileKey
4. 旧数据通过 src 字段保持兼容

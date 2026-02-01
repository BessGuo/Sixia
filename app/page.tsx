'use client';

import React from 'react';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlusIcon,
  SettingsIcon,
  LogOutIcon,
  SearchIcon,
  XIcon,
  SparklesIcon,
  ImageIcon,
} from 'lucide-react';

type ContentBlock =
  | { type: 'text'; content: string }
  | { type: 'image'; src: string };

type Note = {
  id: string;
  content: ContentBlock[];
  createdAt: string;
  updatedAt: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { type: 'text', content: '' },
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [layout, setLayout] = useState<'list' | 'masonry'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name: string;
  } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    const themeClasses: Record<string, string> = {
      default: '',
      warm: 'theme-warm',
      fresh: 'theme-fresh',
      dark: 'dark',
    };
    document.documentElement.className = themeClasses[savedTheme] || '';

    const savedLayout = localStorage.getItem('layout') || 'list';
    setLayout(savedLayout as 'list' | 'masonry');

    const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loginStatus);

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      if (loginStatus) {
        fetchNotes(user.id);
      }
    }
  }, []);

  const fetchNotes = async (userId: string) => {
    try {
      const response = await fetch(`/api/notes?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes;
    }
    return notes.filter((note) =>
      note.content.some(
        (block) =>
          block.type === 'text' &&
          block.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [notes, searchQuery]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imgSrc = reader.result as string;
        setContentBlocks((prev) => [
          ...prev,
          { type: 'image', src: imgSrc },
          { type: 'text', content: '' },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleTextChange = (index: number, value: string) => {
    setContentBlocks((prev) => {
      const newBlocks = [...prev];
      if (newBlocks[index] && newBlocks[index].type === 'text') {
        (newBlocks[index] as { type: 'text'; content: string }).content = value;
      }
      return newBlocks;
    });
  };

  const handleRemoveBlock = (index: number) => {
    setContentBlocks((prev) => {
      const newBlocks = prev.filter((_, i) => i !== index);
      return newBlocks.length === 0
        ? [{ type: 'text', content: '' }]
        : newBlocks;
    });
  };

  const handleAddNote = async () => {
    if (!currentUser) return;

    const hasContent = contentBlocks.some(
      (block) =>
        (block.type === 'text' && block.content.trim()) ||
        block.type === 'image'
    );

    if (hasContent) {
      const filteredBlocks = contentBlocks.filter(
        (block) =>
          block.type === 'image' ||
          (block.type === 'text' && block.content.trim())
      );

      try {
        const response = await fetch(`/api/notes?userId=${currentUser.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: filteredBlocks,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setNotes([data.note, ...notes]);
          setContentBlocks([{ type: 'text', content: '' }]);
          setIsExpanded(false);
        }
      } catch (error) {
        console.error('Failed to create note:', error);
      }
    }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) return;

    setIsLoading(true);
    setAuthError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setShowAuthDialog(false);
        setLoginEmail('');
        setLoginPassword('');
        setAuthError('');
        // Load user's notes
        fetchNotes(data.user.id);
      } else {
        setAuthError(data.error || '登录失败');
      }
    } catch (error) {
      setAuthError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (
      !registerEmail ||
      !registerPassword ||
      !registerConfirmPassword ||
      !registerName ||
      registerPassword !== registerConfirmPassword
    ) {
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          name: registerName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setShowAuthDialog(false);
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
        setRegisterName('');
        setAuthError('');
        // Load user's notes
        fetchNotes(data.user.id);
      } else {
        setAuthError(data.error || '注册失败');
      }
    } catch (error) {
      setAuthError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('currentUser');
  };

  const formatNoteTime = (createdAt: string) => {
    return new Date(createdAt).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderNoteContent = (blocks: ContentBlock[]) => {
    return blocks.map((block, idx) => {
      if (block.type === 'text') {
        return (
          <p
            key={idx}
            className="font-serif text-base leading-relaxed text-foreground text-pretty whitespace-pre-wrap"
          >
            {block.content}
          </p>
        );
      } else {
        return (
          <img
            key={idx}
            src={block.src || '/placeholder.svg'}
            alt=""
            className="w-full h-auto rounded-lg object-cover my-3"
          />
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-foreground">
              思匣
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">SIXIA</p>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {notes.length} 篇记录
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="focus:outline-none focus:ring-2 focus:ring-ring rounded-full"
                      type="button"
                    >
                      <Avatar className="w-9 h-9 cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">
                          {currentUser?.name?.charAt(0) || '思'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/settings" className="flex items-center">
                        <SettingsIcon className="w-4 h-4 mr-2" />
                        个人设置
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOutIcon className="w-4 h-4 mr-2" />
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                onClick={() => setShowAuthDialog(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                登录 / 注册
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center mb-6">
              <SparklesIcon className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground mb-4 text-balance text-center">
              记录每一个灵感瞬间
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 text-balance text-center max-w-md leading-relaxed">
              一个极简的笔记工具。快速记录你的想法，随时回顾你的创意时刻。
            </p>
            <Button
              onClick={() => setShowAuthDialog(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-base"
            >
              开始使用
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
                  <PlusIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">极简记录</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  专注于内容本身，无干扰的写作体验
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">快速检索</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  强大的搜索功能，瞬间找到历史笔记
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
                  <SettingsIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">个性化</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  多种主题和布局，打造专属笔记空间
                </p>
              </Card>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="搜索笔记内容..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-card border-border focus:border-accent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-xs text-muted-foreground mt-2">
                  找到 {filteredNotes.length} 条结果
                </p>
              )}
            </div>

            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <PlusIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">暂无记录</p>
                <p className="text-muted-foreground text-xs mt-1">
                  点击下方按钮开始记录
                </p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <SearchIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  未找到匹配的笔记
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  尝试使用其他关键词搜索
                </p>
              </div>
            ) : layout === 'masonry' ? (
              <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                {filteredNotes.map((note) => (
                  <Card
                    key={note.id}
                    className="break-inside-avoid p-5 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="space-y-3">
                      {renderNoteContent(note.content)}
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                      {formatNoteTime(note.createdAt)}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <Card
                    key={note.id}
                    className="p-5 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="space-y-3">
                      {renderNoteContent(note.content)}
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                      {formatNoteTime(note.createdAt)}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">
              欢迎来到思匣
            </DialogTitle>
            <DialogDescription>登录或注册开始记录你的想法</DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="login"
            className="mt-4"
            onValueChange={() => setAuthError('')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              {authError && (
                <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {authError}
                </p>
              )}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="login-email"
                >
                  邮箱
                </label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="login-password"
                >
                  密码
                </label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="输入密码"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleLogin}
                disabled={!loginEmail || !loginPassword || isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-6">
              {authError && (
                <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {authError}
                </p>
              )}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="register-name"
                >
                  昵称
                </label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="你的昵称"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="register-email"
                >
                  邮箱
                </label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="your@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="register-password"
                >
                  密码
                </label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="设置密码"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="register-confirm"
                >
                  确认密码
                </label>
                <Input
                  id="register-confirm"
                  type="password"
                  placeholder="再次输入密码"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  className="h-11"
                  disabled={isLoading}
                />
                {registerConfirmPassword &&
                  registerPassword !== registerConfirmPassword && (
                    <p className="text-xs text-destructive">
                      两次输入的密码不一致
                    </p>
                  )}
              </div>
              <Button
                onClick={handleRegister}
                disabled={
                  !registerEmail ||
                  !registerPassword ||
                  !registerConfirmPassword ||
                  !registerName ||
                  registerPassword !== registerConfirmPassword ||
                  isLoading
                }
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
              >
                {isLoading ? '注册中...' : '注册'}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {isLoggedIn && (
        <div className="fixed bottom-0 left-0 right-0 z-20 backdrop-blur-lg bg-background/95 border-t border-border">
          <div className="max-w-2xl mx-auto px-4 py-4">
            {isExpanded ? (
              <div className="space-y-3">
                <div className="min-h-32 max-h-96 overflow-y-auto border border-border rounded-lg bg-card p-3 focus-within:border-accent transition-colors">
                  {contentBlocks.map((block, index) => (
                    <div key={index} className="relative group">
                      {block.type === 'text' ? (
                        <textarea
                          value={block.content}
                          onChange={(e) =>
                            handleTextChange(index, e.target.value)
                          }
                          placeholder={
                            index === 0 ? '记录此刻的想法...' : '继续输入...'
                          }
                          className="w-full bg-transparent font-serif text-base resize-none border-none outline-none text-foreground placeholder:text-muted-foreground min-h-[2rem]"
                          rows={3}
                        />
                      ) : (
                        <div className="relative my-3 group/img">
                          <img
                            src={block.src || '/placeholder.svg'}
                            alt=""
                            className="w-full max-h-64 object-contain rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveBlock(index)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                            type="button"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors border border-border"
                  >
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  </label>
                  <Button
                    onClick={handleAddNote}
                    disabled={
                      !contentBlocks.some(
                        (b) =>
                          (b.type === 'text' && b.content.trim()) ||
                          b.type === 'image'
                      )
                    }
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    保存
                  </Button>
                  <Button
                    onClick={() => {
                      setIsExpanded(false);
                      setContentBlocks([{ type: 'text', content: '' }]);
                    }}
                    variant="outline"
                    className="px-6"
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsExpanded(true)}
                variant="outline"
                className="w-full h-12 justify-start text-muted-foreground hover:text-foreground border-border"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                记录新想法...
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

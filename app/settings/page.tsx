'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowLeftIcon,
  CheckIcon,
  LayoutListIcon,
  LayoutGridIcon,
} from 'lucide-react';

const themes = [
  {
    id: 'default',
    name: '极简灰',
    description: '经典黑白灰配色，纯粹简约',
    className: '',
    preview: {
      background: 'bg-[#fcfcfc]',
      card: 'bg-white',
      text: 'text-gray-800',
      accent: 'bg-blue-100',
    },
  },
  {
    id: 'warm',
    name: '温暖米色',
    description: '柔和舒适的米色调，温馨雅致',
    className: 'theme-warm',
    preview: {
      background: 'bg-[#f8f6f1]',
      card: 'bg-[#fdfcf9]',
      text: 'text-amber-900',
      accent: 'bg-amber-200',
    },
  },
  {
    id: 'fresh',
    name: '清新绿',
    description: '自然清爽的绿色系，宁静舒心',
    className: 'theme-fresh',
    preview: {
      background: 'bg-[#f7faf9]',
      card: 'bg-[#fdfefe]',
      text: 'text-emerald-900',
      accent: 'bg-emerald-200',
    },
  },
  {
    id: 'dark',
    name: '深色模式',
    description: '暗色护眼模式，沉浸专注',
    className: 'dark',
    preview: {
      background: 'bg-gray-900',
      card: 'bg-gray-800',
      text: 'text-gray-100',
      accent: 'bg-blue-900',
    },
  },
];

const layouts = [
  {
    id: 'list',
    name: '列表式',
    description: '传统列表布局，整齐有序',
    icon: LayoutListIcon,
  },
  {
    id: 'masonry',
    name: '瀑布式',
    description: 'INS 风格瀑布流，灵动自然',
    icon: LayoutGridIcon,
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [selectedLayout, setSelectedLayout] = useState('list');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    const savedLayout = localStorage.getItem('layout') || 'list';
    setSelectedTheme(savedTheme);
    setSelectedLayout(savedLayout);
  }, []);

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem('theme', themeId);

    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      document.documentElement.className = theme.className;
    }
  };

  const handleLayoutChange = (layoutId: string) => {
    setSelectedLayout(layoutId);
    localStorage.setItem('layout', layoutId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">个人设置</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <section>
          <h2 className="text-sm font-medium text-foreground mb-1">界面配色</h2>
          <p className="text-xs text-muted-foreground mb-4">
            选择你喜欢的配色方案，让思匣更符合你的审美
          </p>

          <div className="space-y-3">
            {themes.map((theme) => (
              <Card
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedTheme === theme.id
                    ? 'ring-2 ring-primary shadow-sm'
                    : 'hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border shadow-sm">
                    <div
                      className={`w-full h-full ${theme.preview.background} p-1.5`}
                    >
                      <div
                        className={`w-full h-full ${theme.preview.card} rounded p-1`}
                      >
                        <div
                          className={`w-full h-2 ${theme.preview.text} opacity-80 rounded-sm mb-1`}
                        />
                        <div
                          className={`w-2/3 h-2 ${theme.preview.text} opacity-60 rounded-sm mb-1`}
                        />
                        <div
                          className={`w-4 h-4 ${theme.preview.accent} rounded-sm mt-auto ml-auto`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">
                        {theme.name}
                      </h3>
                      {selectedTheme === theme.id && (
                        <CheckIcon className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-pretty">
                      {theme.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Layout Settings */}
        <section className="mt-8 pt-8 border-t border-border">
          <h2 className="text-sm font-medium text-foreground mb-1">列表显示</h2>
          <p className="text-xs text-muted-foreground mb-4">
            选择笔记的展示方式
          </p>

          <div className="grid grid-cols-2 gap-3">
            {layouts.map((layout) => {
              const IconComponent = layout.icon;
              return (
                <Card
                  key={layout.id}
                  onClick={() => handleLayoutChange(layout.id)}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedLayout === layout.id
                      ? 'ring-2 ring-primary shadow-sm'
                      : 'hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedLayout === layout.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      } transition-colors`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <h3 className="font-medium text-foreground text-sm">
                          {layout.name}
                        </h3>
                        {selectedLayout === layout.id && (
                          <CheckIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {layout.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Additional Settings Placeholder */}
        <section className="mt-8 pt-8 border-t border-border">
          <h2 className="text-sm font-medium text-foreground mb-4">其他设置</h2>
          <div className="flex items-center justify-center py-12">
            <p className="text-xs text-muted-foreground">更多设置即将推出</p>
          </div>
        </section>
      </main>
    </div>
  );
}

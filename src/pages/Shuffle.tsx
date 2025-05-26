import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

// Fisher-Yates 洗牌算法
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 动态计算列数和每行单元格高度
function getGridConfig(): { columns: number; cellHeight: number } {
  const width = window.innerWidth;
  if (width < 768) {
    return { columns: 3, cellHeight: width / 3 }; // 小屏幕：3 栏
  } else if (width < 1024) {
    return { columns: 4, cellHeight: width / 4 }; // 中等屏幕：4 栏
  } else if (width < 1280) {
    return { columns: 5, cellHeight: width / 5 }; // 大屏幕：5 栏
  } else {
    return { columns: 6, cellHeight: width / 6 }; // 超大屏幕：6 栏
  }
}

// 生成随机颜色
function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// 随机生成网格大小，增加 2x1 和 1x2 的权重
const GRID_SIZES = [
  { rows: 1, cols: 1 },
  { rows: 1, cols: 1 },
  { rows: 2, cols: 1 }, // 增加 2x1 权重
  { rows: 2, cols: 1 },
  { rows: 1, cols: 2 }, // 增加 1x2 权重
  { rows: 1, cols: 2 },
  { rows: 2, cols: 2 },
  { rows: 3, cols: 2 },
  { rows: 2, cols: 3 },
  { rows: 3, cols: 3 },
];

// 色块专用大小（1x1 为主，最大 2x1 或 1x2）
const COLOR_SIZES = [
  { rows: 1, cols: 1 },
  { rows: 1, cols: 1 },
  { rows: 2, cols: 1 },
  { rows: 1, cols: 2 },
];

interface PostPreview {
  id: string; // 原始 posts 表的 id，用于跳转
  key: string; // 用于 React 渲染的唯一 key
  content_url: string | null;
  rows: number;
  cols: number;
  backgroundColor?: string;
}

export default function Shuffle() {
  const [gridItems, setGridItems] = useState<PostPreview[]>([]);
  const [gridConfig, setGridConfig] = useState(getGridConfig());
  const [totalCells, setTotalCells] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const itemCounter = useRef(0); // 用于生成唯一 key
  const usedItemIds = useRef<Set<string>>(new Set()); // 记录已使用的图片 ID

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['shufflePosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, content_url')
        .order('created_at', { ascending: false });
      if (error) throw error;
      console.log('Fetched data:', data);
      return data.map((p) => ({
        id: p.id,
        content_url: p.content_url?.trim() || null,
      }));
    },
    enabled: true,
  });

  // 动态调整网格配置并计算 totalCells
  useEffect(() => {
    const updateGridConfig = () => {
      const config = getGridConfig();
      setGridConfig(config);

      // 计算两个页面高度所需的单元格数量，考虑最大尺寸 3x3
      const pageHeight = window.innerHeight;
      const targetHeight = pageHeight * 2; // 两个页面高度
      const cellHeight = config.cellHeight; // 每个单元格的高度
      const maxRowsPerItem = 3; // 最大尺寸为 3x3
      const rowsNeeded = Math.ceil((targetHeight / cellHeight) * maxRowsPerItem); // 需要的行数（保守估计）
      const cellsNeeded = rowsNeeded * config.columns; // 需要的总单元格数
      setTotalCells(cellsNeeded);
      console.log(`Total cells needed: ${cellsNeeded}, Columns: ${config.columns}`);
    };

    window.addEventListener('resize', updateGridConfig);
    updateGridConfig();
    return () => window.removeEventListener('resize', updateGridConfig);
  }, []);

  const generateGridItems = useCallback(
    (existingItems: PostPreview[] = [], cellsToAdd: number) => {
      const shuffled: PostPreview[] = [...existingItems];
      let occupiedCells = existingItems.reduce((sum, item) => sum + (item.rows * item.cols), 0);
      const targetCells = occupiedCells + cellsToAdd; // 目标总单元格数

      // 如果没有数据，全部用随机色块填充
      if (!data || data.length === 0) {
        console.log('No data to shuffle, filling with random colors');
        while (occupiedCells < targetCells) {
          const size = COLOR_SIZES[Math.floor(Math.random() * COLOR_SIZES.length)];
          const cellsNeeded = size.rows * size.cols;
          if (occupiedCells + cellsNeeded <= targetCells) {
            shuffled.push({
              id: '',
              key: `empty-${Date.now()}-${itemCounter.current++}`,
              content_url: null,
              rows: size.rows,
              cols: size.cols,
              backgroundColor: getRandomColor(),
            });
            occupiedCells += cellsNeeded;
          } else {
            // 强制用 1x1 填充剩余空间
            shuffled.push({
              id: '',
              key: `empty-${Date.now()}-${itemCounter.current++}`,
              content_url: null,
              rows: 1,
              cols: 1,
              backgroundColor: getRandomColor(),
            });
            occupiedCells += 1;
          }
        }
        return shuffled;
      }

      // 确定色块数量（10%-20% of cellsToAdd）
      const colorBlockCount = Math.floor(cellsToAdd * 0.1 + Math.random() * (cellsToAdd * 0.1));
      const imageCount = Math.min(data.length, cellsToAdd - colorBlockCount);
      // 过滤掉已使用的图片
      const availableData = data.filter(item => !usedItemIds.current.has(item.id));
      const validData = shuffleArray(availableData).slice(0, imageCount);

      // 分配图片，限制 3x3 和 2x2 数量
      let count3x3 = 0;
      let count2x2 = 0;
      const max3x3 = 1; // 每版面最多 1 个 3x3
      const max2x2 = Math.floor(Math.random() * 2) + 1; // 每版面 1-2 个 2x2

      for (const item of validData) {
        if (occupiedCells >= targetCells) break;
        // 过滤尺寸，确保不超过网格列数
        const filteredSizes = GRID_SIZES.filter(size => size.cols <= gridConfig.columns);
        let size = filteredSizes[Math.floor(Math.random() * filteredSizes.length)];
        if (size.rows === 3 && size.cols === 3 && count3x3 >= max3x3) {
          size = filteredSizes.find(s => s.rows !== 3 || s.cols !== 3) || { rows: 1, cols: 1 };
        }
        if (size.rows === 2 && size.cols === 2 && count2x2 >= max2x2) {
          size = filteredSizes.find(s => s.rows !== 2 || s.cols !== 2) || { rows: 1, cols: 1 };
        }

        const cellsNeeded = size.rows * size.cols;
        if (occupiedCells + cellsNeeded <= targetCells) {
          const uniqueKey = `${item.id}-${Date.now()}-${itemCounter.current++}`;
          shuffled.push({
            id: item.id, // 保留原始 id 用于跳转
            key: uniqueKey, // 用于 React 渲染的 key
            content_url: item.content_url,
            rows: size.rows,
            cols: size.cols,
          });
          usedItemIds.current.add(item.id); // 记录已使用的图片 ID
          occupiedCells += cellsNeeded;
          if (size.rows === 3 && size.cols === 3) count3x3++;
          if (size.rows === 2 && size.cols === 2) count2x2++;
        }
      }

      // 分配随机色块，填充剩余空间
      while (occupiedCells < targetCells) {
        const size = COLOR_SIZES[Math.floor(Math.random() * COLOR_SIZES.length)];
        const cellsNeeded = size.rows * size.cols;
        if (occupiedCells + cellsNeeded <= targetCells && size.cols <= gridConfig.columns) {
          shuffled.push({
            id: '',
            key: `color-${Date.now()}-${itemCounter.current++}`,
            content_url: null,
            rows: size.rows,
            cols: size.cols,
            backgroundColor: getRandomColor(),
          });
          occupiedCells += cellsNeeded;
        } else {
          // 强制用 1x1 填充剩余空间
          shuffled.push({
            id: '',
            key: `color-${Date.now()}-${itemCounter.current++}`,
            content_url: null,
            rows: 1,
            cols: 1,
            backgroundColor: getRandomColor(),
          });
          occupiedCells += 1;
        }
      }

      console.log('Generated grid items:', shuffled);
      return shuffled;
    },
    [data, gridConfig]
  );

  // 初始加载
  useEffect(() => {
    if (totalCells > 0 && (data || (!data && gridItems.length === 0))) {
      usedItemIds.current.clear(); // 重置已使用的 ID
      const newItems = generateGridItems([], totalCells);
      setGridItems(newItems);
    }
  }, [data, totalCells, generateGridItems]);

  // 无限滚动加载更多
  const loadMore = useCallback(() => {
    const newCells = totalCells / 2; // 每次加载半个页面高度的单元格
    const newItems = generateGridItems(gridItems, newCells);
    setGridItems(newItems);
    console.log('Loaded more items:', newItems.length);
  }, [gridItems, totalCells, generateGridItems]);

  // 设置 Intersection Observer 检测底部
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          console.log('Reached bottom, loading more...');
          loadMore();
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadMore, isLoading]);

  // 防护 `mouseup` 事件
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      try {
        if (!e.target || !('className' in e.target)) {
          console.warn('Event target lacks className:', e.target);
          e.stopPropagation();
          return;
        }
        if (typeof e.target.className !== 'string') {
          console.warn('Non-string className detected:', e.target.className);
          e.stopPropagation();
          return;
        }
      } catch (err) {
        console.error('MouseUp error handled:', err);
        e.stopPropagation();
      }
    };
    document.addEventListener('mouseup', handleMouseUp, { capture: true });
    return () => document.removeEventListener('mouseup', handleMouseUp, { capture: true });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-stone-200 dark:bg-stone-950">
        <Header>
          <Button
            onClick={() => setGridItems(generateGridItems([], totalCells))}
            className="bg-[var(--color-button-pink)] text-white hover:bg-[var(--color-brand-pink)] ml-2"
            disabled
          >
            Shuffle
          </Button>
        </Header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-stone-200 dark:bg-stone-950">
        <Header>
          <Button
            onClick={() => setGridItems(generateGridItems([], totalCells))}
            className="bg-[var(--color-button-pink)] text-white hover:bg-[var(--color-brand-pink)] ml-2"
          >
            Shuffle
          </Button>
        </Header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">Failed to load posts: {error.message}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-200 dark:bg-stone-950">
      <Header>
        <Button
          onClick={() => setGridItems(generateGridItems([], totalCells))}
          className="bg-[var(--color-button-pink)] text-white hover:bg-[var(--color-brand-pink)] ml-2"
        >
          Shuffle
        </Button>
      </Header>
      <div className="flex-1 p-4 flex justify-center">
        {gridItems.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No posts available</p>
          </div>
        ) : (
          <div
            className="w-full max-w-6xl grid gap-2 h-full"
            style={{ gridTemplateColumns: `repeat(${gridConfig.columns}, minmax(0, 1fr))` }}
          >
            {gridItems.map((item) => (
              <Link
                to={item.content_url && item.id ? `/comments/${item.id}` : '#'}
                key={item.key} // 使用 key 字段作为 React 的 key
                className="relative"
                style={{
                  gridRow: `span ${item.rows}`,
                  gridColumn: `span ${item.cols}`,
                  aspectRatio: '1 / 1',
                }}
              >
                <div
                  className="w-full h-full bg-center bg-cover rounded-md hover:opacity-80 transition-opacity"
                  style={{
                    backgroundImage: item.content_url ? `url("${item.content_url}")` : 'none',
                    backgroundColor: item.backgroundColor || 'transparent',
                  }}
                />
              </Link>
            ))}
            <div ref={loadMoreRef} style={{ height: '100px', background: 'transparent' }} />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
} 
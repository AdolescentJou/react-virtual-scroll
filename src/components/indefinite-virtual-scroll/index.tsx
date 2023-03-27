import React, { memo, useState, useMemo, useCallback, useRef, useEffect } from 'react';

const VirList4 = memo(function ({ list = [], containerHeight = 800, ItemBox = <></>, estimatedItemHeight = 90, ...props }: any) {
  // 容器ref
  const ContainerRef = useRef<any>(null);
  const WraperRef = useRef<any>();
  const [startIndex, setStartIndex] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // 初始化缓存数组
  // 先给没有渲染出来的列表项设置一个预估高度，等到这些数据渲染成真实dom元素了之后，再获取到他们的真实高度去更新原来设置的预估高度
  // 高度尽量往小范围设置，避免出现空白
  const [positionCache, setPositionCache] = useState(function () {
    const positList: any = [];
    list.forEach((_: any, i: number) => {
      positList[i] = {
        index: i,
        height: estimatedItemHeight,
        top: i * estimatedItemHeight,
        bottom: (i + 1) * estimatedItemHeight, // 元素底部和容器顶部的距离
      };
    });
    return positList;
  });

  // 根据缓存数组的高度，来设置展示条数
  const limit = useMemo(
    function () {
      let sum = 0;
      let i = 0;
      for (; i < positionCache.length; i++) {
        sum += positionCache[i].height;
        if (sum >= containerHeight) {
          break;
        }
      }
      return i;
    },
    [positionCache],
  );

  // 列表高度，用于撑开滚动条
  const wraperHeight = useMemo(
    function () {
      let len = positionCache.length;
      if (len !== 0) {
        return positionCache[len - 1].bottom;
      }
      return list.length * estimatedItemHeight;
    },
    [list, positionCache, estimatedItemHeight],
  );

  // 每次滚动，都去更新缓存数组中dom的高度和位置
  useEffect(
    function () {
      // 获取当前视口中的列表节点
      const nodeList = WraperRef.current.childNodes;
      const positList = [...positionCache];
      let needUpdate = false;
      nodeList.forEach((node: any) => {
        let newHeight = node.clientHeight;
        // 获取节点id，映射缓存数组中的位置
        const nodeID = Number(node.id.split('-')[1]);
        const oldHeight = positionCache[nodeID]['height'];
        // 高度发生变化，更新缓存数组
        const dValue = oldHeight - newHeight;
        if (dValue) {
          needUpdate = true;
          positList[nodeID].height = node.clientHeight;
          // 当前节点与底部的距离 = 上一个节点与底部的距离 + 当前节点的高度
          positList[nodeID].bottom = nodeID > 0 ? positList[nodeID - 1].bottom + positList[nodeID].height : positList[nodeID].height;
          // 当前节点与顶部的距离 = 上一个节点与底部的距离
          positList[nodeID].top = nodeID > 0 ? positList[nodeID - 1].bottom : 0;
          // 更改一个节点就需要更改之后所有的值，不然会造成空白
          for (let j = nodeID + 1, len = positList.length; j < len; j++) {
            positList[j].top = positList[j - 1].bottom;
            positList[j].bottom += dValue;
          }
        }
      });
      // 相同节点不更新数组
      if (needUpdate) {
        setPositionCache(positList);
      }
    },
    [scrollTop],
  );

  // 使用translate来校正滚动条位置
  // 也可以使用paddingTop来实现，目的是将子节点准确放入视口中
  const getTransform = useCallback(
    function () {
      // return `translate3d(0,${startIndex >= 1 ? positionCache[startIndex - 1].bottom : 0}px,0)`;
      return {
        // 改变空白填充区域的样式，起始元素的top值就代表起始元素距顶部的距离，可以用来充当paddingTop值
        paddingTop: `${positionCache[startIndex].top}px`,
        // 缓存中最后一个元素的bottom值与endIndex对应元素的bottom值的差值可以用来充当paddingBottom的值
        paddingBottom: `${positionCache[positionCache.length - 1].bottom - positionCache[endIndex].bottom}px`,
      };
    },
    [positionCache, startIndex],
  );

  // 滚动事件监听
  const handleSrcoll = useCallback(
    function (e: any) {
      if (e.target !== ContainerRef.current) return;
      const scrollTop = e.target.scrollTop;
      setScrollTop(scrollTop);

      // 根据当前偏移量，获取当前最上方的元素
      // 因为滚轮一开始一定是往下的，所以上方的元素高度与顶部和底部的距离等都是被缓存的
      const currentStartIndex = getStartIndex(scrollTop);
      // console.log(currentStartIndex);
      // 设置索引
      if (currentStartIndex !== startIndex) {
        setStartIndex(currentStartIndex);
        // console.log(startIndex + '====--' + limit + '--====' + endIndex);
      }
    },
    [ContainerRef, estimatedItemHeight, startIndex],
  );

  // 结束条数的索引
  const endIndex = useMemo(
    function () {
      return Math.min(startIndex + limit, list.length - 1);
    },
    [startIndex, limit],
  );

  // 索引更改后重新渲染列表
  const renderList = useCallback(
    function () {
      const rows = [];
      for (let i = startIndex; i <= endIndex; i++) {
        rows.push(
          <ItemBox
            data={list[i]}
            index={i}
            key={i}
            style={{
              width: '100%',
              borderBottom: '1px solid #aaa',
            }}
          />,
        );
      }
      return rows;
    },
    [startIndex, endIndex, ItemBox],
  );

  const CompareResult = {
    eq: 1,
    lt: 2,
    gt: 3,
  };

  // 如果滚轮从下往上滚动，我们就可以通过二分查找快速找到最上方的节点
  const getStartIndex = function (scrollTop: any) {
    let idx =
      binarySearch(positionCache, scrollTop, (currentValue: any, targetValue: any) => {
        // 传入的比较方法，通过比较顶部距离与最上方节点的bottom值来决定列表的第一个元素
        const currentCompareValue = currentValue.bottom;
        if (currentCompareValue === targetValue) {
          return CompareResult.eq;
        }
        if (currentCompareValue < targetValue) {
          return CompareResult.lt;
        }
        return CompareResult.gt;
      }) || 0;
    const targetItem = positionCache[idx];
    if (targetItem.bottom < scrollTop) {
      idx += 1;
    }
    return idx;
  };

  // 二分查找核心算法
  const binarySearch = function (list: any, value: any, compareFunc: any) {
    let start = 0;
    let end = list.length - 1;
    let tempIndex = null;
    while (start <= end) {
      tempIndex = Math.floor((start + end) / 2);
      const midValue = list[tempIndex];
      const compareRes = compareFunc(midValue, value);
      // 一般情况是找不到完全相等的值，只能找到最接近的值
      if (compareRes === CompareResult.eq) {
        return tempIndex;
      }
      if (compareRes === CompareResult.lt) {
        start = tempIndex + 1;
      } else if (compareRes === CompareResult.gt) {
        end = tempIndex - 1;
      }
    }
    return tempIndex;
  };

  return (
    <div style={{ overflowY: 'auto', overflowX: 'hidden', height: `${containerHeight + 'px'}` }} ref={ContainerRef} onScroll={handleSrcoll}>
      <div style={{ position: 'relative', backgroundColor: 'pink', height: wraperHeight + 'px' }}>
        <div style={getTransform()} ref={WraperRef}>
          {renderList()}
        </div>
      </div>
    </div>
  );
});

export default VirList4;

import React, { memo, useState, useMemo, useCallback, useRef } from 'react';

const FixedVirtualScroll = memo(function ({ list = [], containerHeight = 800, ItemBox = <></>, itemHeight = 50, ...props }: any) {
  const ContainerRef = useRef(null);
  const [startIndex, setStartIndex] = useState(0);
  // 用于撑开Container的盒子，计算其高度
  const wraperHeight = useMemo(
    function () {
      return list.length * itemHeight;
    },
    [list, itemHeight],
  );
  // 可视区域最多显示的条数
  const limit = useMemo(
    function () {
      return Math.ceil(containerHeight / itemHeight);
    },
    [startIndex],
  );
  // 当前可视区域显示的列表的结束索引
  const endIndex = useMemo(
    function () {
      return Math.min(startIndex + limit, list.length - 1);
    },
    [startIndex, limit],
  );

  // 核心方法
  const handleSrcoll = useCallback(
    function (e: any) {
      // 过滤页面其他滚动
      if (e.target !== ContainerRef.current) return;
      const scrollTop = e.target.scrollTop;
      // 根据滚动距离计算开始项索引
      let currentIndex = Math.floor(scrollTop / itemHeight);
      if (currentIndex !== startIndex) {
        setStartIndex(currentIndex);
      }
    },
    [ContainerRef, itemHeight, startIndex],
  );

  // 利用请求动画帧做了一个节流优化
  let then = useRef(0);
  const boxScroll = (e:any) => {
    const now = Date.now();
    /**
     * 这里的等待时间不宜设置过长，不然会出现滑动到空白占位区域的情况
     * 因为间隔时间过长的话，太久没有触发滚动更新事件，下滑就会到padding-bottom的空白区域
     * 电脑屏幕的刷新频率一般是60HZ，渲染的间隔时间为16.6ms，我们的时间间隔最好小于两次渲染间隔16.6*2=33.2ms，一般情况下30ms左右，
     */
    if (now - then.current > 30) {
      then.current = now;
      // 重复调用scrollHandle函数，让浏览器在下一次重绘之前执行函数，可以确保不会出现丢帧现象
      window.requestAnimationFrame(() => handleSrcoll(e));
    }
  };

  const renderList = useCallback(
    function () {
      const rows = [];
      // 多展示渲染1 个，保证滑动过快不会白屏
      for (let i = startIndex; i <= endIndex + 1; i++) {
        // 渲染每个列表项
        rows.push(
          <ItemBox
            data={i}
            key={i}
            style={{
              width: '100%',
              height: itemHeight - 11 + 'px',
              marginTop: '10px',
              borderBottom: '1px solid #aaa',
              position: 'absolute',
              top: i * itemHeight + 'px',
              left: 0,
              right: 0,
              backgroundColor: 'orange',
            }}
          />,
        );
      }
      return rows;
    },
    [startIndex, endIndex, ItemBox],
  );

  return (
    <div style={{ overflowY: 'auto', overflowX: 'hidden', height: `${containerHeight + 'px'}` }} ref={ContainerRef} onScroll={boxScroll}>
      <div style={{ position: 'relative', height: wraperHeight + 'px' }}>{renderList()}</div>
    </div>
  );
});
export default FixedVirtualScroll;

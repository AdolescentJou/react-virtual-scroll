import { memo, useState } from 'react';
import IndefiniteVirtualScroll from './index';
const TestVirtual2 = () => {
  const [items] = useState(new Array(30).fill(1));
  const ItemBox = memo(({ data = '', index = 0, style = 0 }: any) => {
    let content = '';
    // 模拟不同高度
    if (index % 2 === 0 )
      content =
        '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊';
    else if (index % 3 === 0 )
      content =
        '的点点滴滴多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多dddddddj';
    else
      content =
        'auwgb owbg oebg oen oen oien onei oneoiauwgb owbg oebg oen oen oien onei oneoi eauwgb owbg oebg oen oen oien onei oneoi eauwgb owbg oebg oen oen oien onei oneoi eauwgb owbg oebg oen oen oien onei oneoi eauwgb owbg oebg oen oen oien onei oneoi eauwgb owbg oebg oen oen oien onei oneoi eauwgb owbg oebg oen oen oien onei oneoi e e';
    return (
      <div style={style} id={`item-${index}`}>
        {content}
      </div>
    );
  });

  return (
    <div className={'container'} style={{ width: '600px', margin: 'auto', marginTop:'100px',padding: '15px', border: '1px solid black' }}>
      <IndefiniteVirtualScroll list={items} containerHeight={500} ItemBox={ItemBox} />
    </div>
  );
};

export default TestVirtual2;

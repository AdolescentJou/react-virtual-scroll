import { useState } from 'react';

const ItemBox = ({ title }: any) => {
  return <div style={{ height: '60px', width: '100%', margin: '10px 0', textAlign: 'center', lineHeight: '60px', color: 'white', fontSize: '22px', backgroundColor: 'orange' }}>{title}</div>;
};

let waitList: any = []; //等待队列
let times = 0;

const TimeSlice = () => {
  const [itemList, setItemList] = useState<any>([]);

    // 直接渲染，需要花费621ms
  const renderList = async () => {
    let rows = [];
    // console.time();
    for (let i = 0; i < 10000; i++) {
      rows.push(<ItemBox key={i} title={`这是第${i}个盒子`} />);
    }
    await setItemList(rows);
    // console.timeEnd();
  };

  // 渲染数据给20ms的间隙，让浏览器可以更好的优化渲染
  const renderListByTimeSlice = (list: any[]) => {
    if (list.length === 0) return; //判断条件
    setTimeout(() => {
      const newList: any = list.slice(0, 100).map((_item, i) => <ItemBox key={times * 100 + i} title={`这是第${times * 100 + i}个盒子`} />);
      times = times + 1;
      waitList = [...waitList, ...newList];
      setItemList(waitList);
      renderListByTimeSlice(list.slice(100));
    }, 20);
  };

  return (
    <div className={'container'} style={{ width: '300px', maxHeight: '600px', margin: 'auto', marginTop: '100px', padding: '15px', overflow: 'scroll', border: '1px solid black' }}>
      <button onClick={() => renderList()}>加载数据1</button>
      <button onClick={() => renderListByTimeSlice(new Array(1000).fill('0'))}>加载数据2</button>
      {itemList}
    </div>
  );
};
export default TimeSlice;

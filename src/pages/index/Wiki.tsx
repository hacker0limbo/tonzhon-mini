import { getCloud } from "@/cloud";
import { Table, Tabs, type TableProps } from "@nutui/nutui-react-taro";
import { View } from "@tarojs/components";
import { useEffect, useState } from "react";

export default function Wiki() {
  const [wikiData, setWikiData] = useState<any[]>([]);

  console.log("wikiData", wikiData);

  useEffect(() => {
    getCloud().then((cloud) => {
      cloud
        .database()
        .collection("tz-wiki")
        .get()
        .then((res) => {
          setWikiData(res.data);
        });
    });
  }, []);

  return (
    <View>
      <Tabs defaultValue="中国古代十大乐器">
        {wikiData.map(({ name, columns, data }) => (
          <Tabs.TabPane title={name} key={name} value={name}>
            <Table
              columns={columns.map((c, i) => ({
                title: c,
                key: c,
                fixed: i === 0 ? "left" : undefined,
              }))}
              data={data}
            />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </View>
  );
}

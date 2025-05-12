const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // 既存のデータをクリア
    await prisma.event.deleteMany();
    await prisma.eventType.deleteMany();

    console.log('既存データをクリアしました');

    // イベントタイプの作成
    const eventTypes = await Promise.all([
      prisma.eventType.create({
        data: {
          name: '市民講座',
          color: '#4CAF50', // 緑色
          icon: 'school',
        },
      }),
      prisma.eventType.create({
        data: {
          name: 'お祭り',
          color: '#FF5722', // オレンジ色
          icon: 'celebration',
        },
      }),
      prisma.eventType.create({
        data: {
          name: 'スポーツイベント',
          color: '#2196F3', // 青色
          icon: 'sports',
        },
      }),
      prisma.eventType.create({
        data: {
          name: '文化イベント',
          color: '#9C27B0', // 紫色
          icon: 'theater',
        },
      }),
      prisma.eventType.create({
        data: {
          name: '健康・医療',
          color: '#F44336', // 赤色
          icon: 'health',
        },
      }),
    ]);

    console.log('イベントタイプを作成しました:', eventTypes);

    // 現在の日付を取得
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // サンプルイベントの作成
    const events = await Promise.all([
      // 今月のイベント
      prisma.event.create({
        data: {
          title: '市民健康講座',
          description: '健康的な生活習慣について学びましょう',
          location: '市民会館大ホール',
          startTime: new Date(currentYear, currentMonth, 15, 10, 0),
          endTime: new Date(currentYear, currentMonth, 15, 12, 0),
          eventTypeId: eventTypes[0].id,
        },
      }),
      prisma.event.create({
        data: {
          title: '春の市民祭り',
          description: '地元の出店や演舞が楽しめます',
          location: '中央公園',
          startTime: new Date(currentYear, currentMonth, 20, 10, 0),
          endTime: new Date(currentYear, currentMonth, 20, 18, 0),
          eventTypeId: eventTypes[1].id,
        },
      }),
      // 翌月のイベント
      prisma.event.create({
        data: {
          title: '市民マラソン大会',
          description: '市内を巡る5kmマラソン大会です',
          location: '市役所前スタート',
          startTime: new Date(currentYear, currentMonth + 1, 5, 9, 0),
          endTime: new Date(currentYear, currentMonth + 1, 5, 12, 0),
          eventTypeId: eventTypes[2].id,
        },
      }),
      // 2日間のイベント
      prisma.event.create({
        data: {
          title: '市民文化祭',
          description: '市民の芸術作品の展示や発表会',
          location: '市民文化センター',
          startTime: new Date(currentYear, currentMonth, 25, 10, 0),
          endTime: new Date(currentYear, currentMonth, 26, 16, 0),
          eventTypeId: eventTypes[3].id,
        },
      }),
      // 終日イベント
      prisma.event.create({
        data: {
          title: '健康診断',
          description: '市民健康診断を実施します',
          location: '市保健センター',
          startTime: new Date(currentYear, currentMonth + 1, 10, 0, 0),
          endTime: new Date(currentYear, currentMonth + 1, 10, 23, 59),
          allDay: true,
          eventTypeId: eventTypes[4].id,
        },
      }),
    ]);

    console.log('サンプルイベントを作成しました:', events);
  } catch (error) {
    console.error('シード処理でエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 
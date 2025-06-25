export interface Event {
    id: string;
    title: string;
    titleJa: string;
    description: string;
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    location: "online" | "in-person";
    venue?: string;
    venueJa?: string;
    status: "upcoming" | "open" | "ended";
    participants: {
      current: number;
      max: number;
    };
    prizes: string;
    theme: string;
    themeJa: string;
    organizer: string;
    organizerJa: string;
    image: string;
    tags: string[];
    featured?: boolean;
  }
  
  export const mockEvents: Event[] = [
    {
      id: "1",
      title: "Virtual Innovation Hackathon 2025",
      titleJa: "バーチャルイノベーションハッカソン2025",
      description:
        "Design the future of smart cities in virtual space. Join developers, designers, and innovators in a 48-hour coding marathon.",
      startDate: "2025-09-15",
      endDate: "2025-09-17",
      registrationDeadline: "2025-09-01",
      location: "online",
      venue: "Virtual Naruto City Hall",
      venueJa: "バーチャル鳴門市役所",
      status: "upcoming",
      participants: { current: 32, max: 40 },
      prizes: "¥900,000",
      theme: "Smart Cities & Social Impact",
      themeJa: "スマートシティ・社会課題解決",
      organizer: "TechHub Japan",
      organizerJa: "テックハブ・ジャパン",
      image:
        "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["AI/ML", "IoT", "スマートシティ", "社会課題"],
      featured: true,
    },
    {
      id: "2",
      title: "Tokyo FinTech Challenge",
      titleJa: "東京フィンテック・チャレンジ2025",
      description:
        "Revolutionary financial technology solutions for the next generation. Build the future of digital payments and blockchain.",
      startDate: "2025-08-20",
      endDate: "2025-08-22",
      registrationDeadline: "2025-08-10",
      location: "in-person",
      venue: "Tokyo Tech Center, Shibuya",
      venueJa: "東京テックセンター（渋谷）",
      status: "open",
      participants: { current: 45, max: 60 },
      prizes: "¥1,500,000",
      theme: "Financial Technology",
      themeJa: "フィンテック・金融技術",
      organizer: "FinTech Tokyo",
      organizerJa: "フィンテック東京",
      image:
        "https://images.pexels.com/photos/3861458/pexels-photo-3861458.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["ブロックチェーン", "フィンテック", "決済", "DeFi"],
    },
    {
      id: "3",
      title: "Green Tech Innovation Summit",
      titleJa: "グリーンテック・イノベーション・サミット",
      description:
        "Sustainable technology solutions for environmental challenges. Create impactful solutions for climate change.",
      startDate: "2025-07-10",
      endDate: "2025-07-12",
      registrationDeadline: "2025-06-30",
      location: "in-person",
      venue: "Osaka Innovation Hub",
      venueJa: "大阪イノベーションハブ",
      status: "ended",
      participants: { current: 38, max: 40 },
      prizes: "¥800,000",
      theme: "Environmental Technology",
      themeJa: "環境技術・持続可能性",
      organizer: "GreenTech Alliance",
      organizerJa: "グリーンテック・アライアンス",
      image:
        "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["持続可能性", "クリーンテック", "環境", "エネルギー"],
    },
    {
      id: "4",
      title: "Healthcare AI Hackathon",
      titleJa: "ヘルスケアAIハッカソン2025",
      description:
        "Artificial intelligence solutions for modern healthcare challenges. Build tools that save lives and improve patient care.",
      startDate: "2025-10-05",
      endDate: "2025-10-07",
      registrationDeadline: "2025-09-25",
      location: "online",
      venue: "Virtual Medical Center",
      venueJa: "バーチャル医療センター",
      status: "upcoming",
      participants: { current: 28, max: 50 },
      prizes: "¥1,200,000",
      theme: "Healthcare & AI",
      themeJa: "ヘルスケア・人工知能",
      organizer: "MedTech Innovation",
      organizerJa: "メドテック・イノベーション",
      image:
        "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["ヘルスケア", "AI/ML", "医療", "イノベーション"],
      featured: true,
    },
    {
      id: "5",
      title: "Gaming & VR Experience Jam",
      titleJa: "ゲーミング・VR体験ジャム",
      description:
        "Create immersive gaming experiences and virtual reality applications. Push the boundaries of interactive entertainment.",
      startDate: "2025-08-01",
      endDate: "2025-08-03",
      registrationDeadline: "2025-07-20",
      location: "in-person",
      venue: "Gaming Arena Tokyo",
      venueJa: "ゲーミングアリーナ東京",
      status: "open",
      participants: { current: 52, max: 80 },
      prizes: "¥600,000",
      theme: "Gaming & Virtual Reality",
      themeJa: "ゲーミング・バーチャルリアリティ",
      organizer: "GameDev Tokyo",
      organizerJa: "ゲームデブ東京",
      image:
        "https://images.pexels.com/photos/3861458/pexels-photo-3861458.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["ゲーミング", "VR/AR", "Unity", "エンターテイメント"],
    },
    {
      id: "6",
      title: "EdTech Learning Revolution",
      titleJa: "エドテック学習革命ハッカソン",
      description:
        "Transform education through technology. Build platforms and tools that make learning accessible and engaging for everyone.",
      startDate: "2025-06-25",
      endDate: "2025-06-27",
      registrationDeadline: "2025-06-05",
      location: "online",
      venue: "Virtual Education Hub",
      venueJa: "バーチャル教育ハブ",
      status: "ended",
      participants: { current: 35, max: 40 },
      prizes: "¥700,000",
      theme: "Educational Technology",
      themeJa: "教育技術・EdTech",
      organizer: "EduTech Japan",
      organizerJa: "エドテック・ジャパン",
      image:
        "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["教育", "Eラーニング", "EdTech", "アクセシビリティ"],
    },
  ];
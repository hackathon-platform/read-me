import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Code,
  ArrowRight,
  ExternalLink,
  Zap,
  Sparkles,
  Award,
  Target,
  Rocket,
  Globe,
  Cpu,
  Gamepad2,
  Brain,
  Heart,
  Shield,
  Star,
  TrendingUp,
  Building,
  Briefcase,
  GraduationCap,
  Check,
  X,
  Info,
  MessageCircle,
  Share2,
  BookOpen,
  Video,
  Laptop,
  Coffee,
  Pizza,
  Gift,
  Headphones,
  Wifi,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const EventPage = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<number | null>(null);

  const daysUntil = 74;
  const currentParticipants = 28;
  const maxParticipants = 40;
  const participationProgress = (currentParticipants / maxParticipants) * 100;

  const scheduleItems = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "事前説明会",
      titleEn: "Orientation",
      date: "08月25日(日)",
      time: "14:00 - 16:00",
      description: "ルール説明とチーム編成のコツ",
      status: "upcoming",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "登録開始",
      titleEn: "Registration Opens",
      date: "09月01日(月)",
      time: "13:00",
      description: "チーム登録・個人参加受付開始",
      status: "upcoming",
    },
    {
      icon: <Rocket className="w-5 h-5" />,
      title: "開会式",
      titleEn: "Opening Ceremony",
      date: "09月15日(金)",
      time: "09:00 - 10:00",
      description: "キックオフ・テーマ発表",
      status: "upcoming",
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "ハッキング開始",
      titleEn: "Hacking Begins",
      date: "09月15日(金)",
      time: "10:00",
      description: "48時間のコーディングマラソン",
      status: "upcoming",
    },
    {
      icon: <Coffee className="w-5 h-5" />,
      title: "ミッドナイトセッション",
      titleEn: "Midnight Session",
      date: "09月15日(金)",
      time: "24:00",
      description: "深夜の特別ワークショップ",
      status: "upcoming",
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      title: "デモデー",
      titleEn: "Demo Day",
      date: "09月17日(日)",
      time: "14:00 - 16:00",
      description: "プロジェクト発表・審査",
      status: "upcoming",
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "表彰式",
      titleEn: "Awards Ceremony",
      date: "09月17日(日)",
      time: "17:00 - 19:00",
      description: "結果発表・ネットワーキング",
      status: "upcoming",
    },
  ];

  const prizes = [
    {
      place: "最優秀賞",
      placeEn: "Grand Prize",
      amount: "¥500,000",
      icon: <Trophy className="w-8 h-8" />,
      perks: [
        "現金賞金 ¥500,000",
        "メンターシップ 6ヶ月",
        "インキュベーション支援",
        "メディア掲載",
      ],
      gradient: "from-yellow-400 to-amber-600",
    },
    {
      place: "優秀賞",
      placeEn: "Excellence Award",
      amount: "¥300,000",
      icon: <Award className="w-8 h-8" />,
      perks: ["現金賞金 ¥300,000", "メンターシップ 3ヶ月", "企業訪問の機会"],
      gradient: "from-gray-300 to-gray-500",
    },
    {
      place: "アイデア賞",
      placeEn: "Innovation Award",
      amount: "¥100,000",
      icon: <Sparkles className="w-8 h-8" />,
      perks: [
        "現金賞金 ¥100,000",
        "オンラインメンタリング",
        "次回イベント優先参加",
      ],
      gradient: "from-orange-400 to-rose-600",
    },
  ];

  const sponsors = [
    { name: "TechCorp", logo: "TC", tier: "platinum" },
    { name: "InnovateLab", logo: "IL", tier: "gold" },
    { name: "Future Systems", logo: "FS", tier: "gold" },
    { name: "Digital Dreams", logo: "DD", tier: "silver" },
  ];

  const judges = [
    {
      name: "田中 太郎",
      nameEn: "Taro Tanaka",
      role: "CEO, TechVentures",
      avatar: "/api/placeholder/40/40",
    },
    {
      name: "山田 花子",
      nameEn: "Hanako Yamada",
      role: "CTO, Innovation Labs",
      avatar: "/api/placeholder/40/40",
    },
    {
      name: "鈴木 一郎",
      nameEn: "Ichiro Suzuki",
      role: "Lead Engineer, FutureTech",
      avatar: "/api/placeholder/40/40",
    },
  ];

  const tracks = [
    {
      title: "スマートシティ",
      titleEn: "Smart City",
      icon: <Building className="w-6 h-6" />,
      description: "都市問題を解決する革新的なソリューション",
      color: "text-blue-500",
    },
    {
      title: "ヘルスケア",
      titleEn: "Healthcare",
      icon: <Heart className="w-6 h-6" />,
      description: "医療・健康分野のデジタル変革",
      color: "text-red-500",
    },
    {
      title: "教育テック",
      titleEn: "EdTech",
      icon: <GraduationCap className="w-6 h-6" />,
      description: "学習体験を変える新しいアプローチ",
      color: "text-purple-500",
    },
    {
      title: "サステナビリティ",
      titleEn: "Sustainability",
      icon: <Globe className="w-6 h-6" />,
      description: "持続可能な未来のためのソリューション",
      color: "text-green-500",
    },
  ];

  const perks = [
    { icon: <Wifi className="w-5 h-5" />, text: "高速Wi-Fi完備" },
    { icon: <Coffee className="w-5 h-5" />, text: "フリードリンク" },
    { icon: <Pizza className="w-5 h-5" />, text: "食事提供" },
    { icon: <Headphones className="w-5 h-5" />, text: "作業用BGM" },
    { icon: <Gift className="w-5 h-5" />, text: "参加者特典" },
    { icon: <Video className="w-5 h-5" />, text: "録画アーカイブ" },
  ];

  const faqs = [
    {
      question: "参加資格はありますか？",
      answer:
        "中学生から大学院生まで、プログラミングに興味がある方なら誰でも参加できます。初心者も大歓迎です！",
    },
    {
      question: "チームは何人まで？",
      answer:
        "1チーム2〜5名まで。個人参加の方は、当日チームマッチングも可能です。",
    },
    {
      question: "使用言語・フレームワークに制限は？",
      answer:
        "特に制限はありません。お好きな技術スタックでプロジェクトを作成してください。",
    },
    {
      question: "オンライン参加は可能？",
      answer:
        "はい、完全オンラインでの参加が可能です。バーチャル会場で他の参加者と交流できます。",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="px-3 py-1.5">
                  <Timer className="w-4 h-4 mr-2" />
                  あと{daysUntil}日
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5">
                  <Users className="w-4 h-4 mr-2" />
                  {currentParticipants}/{maxParticipants}名
                </Badge>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1.5">
                  <Zap className="w-4 h-4 mr-2" />
                  募集中
                </Badge>
              </div>

              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Virtual Innovation
                  <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Hackathon 2025
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  未来のスマートシティをデザインする48時間。
                  開発者、デザイナー、イノベーターが集結する
                  バーチャル空間でのハッカソン。
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => setIsRegistered(!isRegistered)}
                  className="group"
                  disabled={participationProgress >= 100}
                >
                  {isRegistered ? (
                    <>
                      <Check className="mr-2 w-5 h-5" />
                      登録済み
                    </>
                  ) : (
                    <>
                      今すぐ参加登録
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
                <Button variant="outline" size="lg">
                  <Info className="mr-2 w-5 h-5" />
                  詳細資料
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="lg">
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>イベントをシェア</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t">
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{maxParticipants}名</div>
                  <div className="text-sm text-muted-foreground">定員</div>
                  <Progress value={participationProgress} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">48時間</div>
                  <div className="text-sm text-muted-foreground">開発期間</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">¥900K</div>
                  <div className="text-sm text-muted-foreground">総賞金</div>
                </div>
              </div>
            </div>

            {/* Interactive Visual */}
            <div className="relative lg:pl-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl" />
                <Card className="relative overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 p-12 flex items-center justify-center">
                      <div className="text-center space-y-6">
                        <div className="relative">
                          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform duration-300">
                            <Code className="w-16 h-16 text-primary-foreground" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Star className="w-5 h-5 text-white fill-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">
                            Virtual City Hall
                          </h3>
                          <p className="text-muted-foreground">
                            バーチャル空間で体験する
                            <br />
                            次世代のイノベーション
                          </p>
                        </div>
                        <div className="flex justify-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full bg-primary/30"
                              style={{
                                animation: `pulse 1.5s infinite ${i * 0.2}s`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="schedule">スケジュール</TabsTrigger>
            <TabsTrigger value="prizes">賞金・特典</TabsTrigger>
            <TabsTrigger value="details">詳細情報</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-12">
            {/* Tracks */}
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">チャレンジトラック</h2>
                <p className="text-muted-foreground text-lg">
                  4つのテーマから選んで、社会課題の解決に挑戦
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tracks.map((track, index) => (
                  <Card
                    key={index}
                    className="group hover:shadow-lg transition-all duration-300"
                  >
                    <CardHeader>
                      <div
                        className={`${track.color} mb-4 group-hover:scale-110 transition-transform`}
                      >
                        {track.icon}
                      </div>
                      <CardTitle className="text-lg">{track.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {track.titleEn}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{track.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Perks */}
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">参加者特典</h2>
                <p className="text-muted-foreground text-lg">
                  快適な開発環境と充実のサポート
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {perks.map((perk, index) => (
                  <Card
                    key={index}
                    className="text-center p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="text-primary mb-2">{perk.icon}</div>
                    <p className="text-sm">{perk.text}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Judges */}
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">審査員</h2>
                <p className="text-muted-foreground text-lg">
                  業界をリードする専門家が審査
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-8">
                {judges.map((judge, index) => (
                  <div key={index} className="text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-3">
                      <AvatarImage src={judge.avatar} />
                      <AvatarFallback>{judge.name[0]}</AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold">{judge.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {judge.nameEn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {judge.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">
                  イベントスケジュール
                </h2>
                <p className="text-muted-foreground text-lg">
                  3日間の熱いチャレンジ
                </p>
              </div>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-8">
                  {scheduleItems.map((item, index) => (
                    <div key={index} className="relative flex gap-6">
                      {/* Timeline dot */}
                      <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-background border-4 border-primary">
                        <div className="text-primary">{item.icon}</div>
                      </div>

                      {/* Content */}
                      <Card className="flex-1 hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {item.title}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {item.titleEn}
                              </p>
                            </div>
                            <Badge variant="outline">
                              <Calendar className="w-3 h-3 mr-1" />
                              {item.date}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Clock className="w-4 h-4" />
                            {item.time}
                          </div>
                          <p className="text-sm">{item.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Prizes Tab */}
          <TabsContent value="prizes" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">賞金 & 特典</h2>
              <p className="text-muted-foreground text-lg">
                優秀なプロジェクトには豪華な賞品を用意
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {prizes.map((prize, index) => (
                <Card
                  key={index}
                  className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedPrize === index
                      ? "ring-2 ring-primary shadow-lg scale-105"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedPrize(index)}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${prize.gradient}`}
                  />
                  <CardHeader className="text-center pt-8">
                    <div
                      className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${prize.gradient} flex items-center justify-center mb-4 text-white`}
                    >
                      {prize.icon}
                    </div>
                    <CardTitle className="text-2xl">{prize.place}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {prize.placeEn}
                    </p>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="text-3xl font-bold">{prize.amount}</div>
                    <Separator />
                    <ul className="text-sm space-y-2 text-left">
                      {prize.perks.map((perk, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sponsors */}
            <div className="mt-12 text-center">
              <h3 className="text-xl font-semibold mb-6">スポンサー</h3>
              <div className="flex flex-wrap justify-center items-center gap-8">
                {sponsors.map((sponsor, index) => (
                  <div key={index} className="text-center">
                    <div
                      className={`w-16 h-16 rounded-lg bg-gradient-to-br ${
                        sponsor.tier === "platinum"
                          ? "from-purple-400 to-purple-600"
                          : sponsor.tier === "gold"
                            ? "from-yellow-400 to-yellow-600"
                            : "from-gray-400 to-gray-600"
                      } flex items-center justify-center text-white font-bold text-xl mb-2`}
                    >
                      {sponsor.logo}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sponsor.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Event Info */}
              <div>
                <h3 className="text-2xl font-bold mb-6">イベント詳細</h3>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="flex items-start gap-4 pt-6">
                      <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold">バーチャル鳴門市役所</p>
                        <p className="text-sm text-muted-foreground">
                          Virtual Naruto City Hall
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          中国・四国地域
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-start gap-4 pt-6">
                      <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold">参加対象</p>
                        <p className="text-sm text-muted-foreground">
                          中学生〜大学院生
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          プログラミング経験不問・初心者歓迎
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-start gap-4 pt-6">
                      <Laptop className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold">参加形式</p>
                        <p className="text-sm text-muted-foreground">
                          完全オンライン
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          バーチャル会場での交流も可能
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              {/* FAQ Accordion */}
              <div>
                <h3 className="text-2xl font-bold mb-6">よくある質問</h3>
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="flex items-center justify-between">
                        <span>{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default EventPage;

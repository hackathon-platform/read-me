import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Code,
  ArrowRight,
  ExternalLink,
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

const EventPage = () => {
  const scheduleItems = [
    {
      icon: <Users className="w-5 h-5" />,
      title: "Registration Opens",
      time: "09月01日(月) 13:00",
      description: "Team formation and registration",
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "Hackathon Begins",
      time: "09月15日(金) 10:00",
      description: "48-hour coding marathon starts",
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      title: "Demo Day",
      time: "09月17日(日) 16:00",
      description: "Project presentations and judging",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Awards Ceremony",
      time: "09月17日(日) 19:00",
      description: "Winner announcements and prizes",
    },
  ];

  const prizes = [
    {
      place: "1st Place",
      amount: "¥500,000",
      color: "bg-gradient-to-r from-yellow-400 to-orange-500",
    },
    {
      place: "2nd Place",
      amount: "¥300,000",
      color: "bg-gradient-to-r from-gray-300 to-gray-400",
    },
    {
      place: "3rd Place",
      amount: "¥100,000",
      color: "bg-gradient-to-r from-orange-400 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-blue-800/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-4 py-2 text-sm font-medium">
                  <Clock className="w-4 h-4 mr-2" />
                  74 Days Remaining
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                  Virtual Innovation
                  <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Hackathon 2025
                  </span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Design the future of smart cities in virtual space. Join
                  developers, designers, and innovators in a 48-hour coding
                  marathon.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
                >
                  Register Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg"
                >
                  View Details
                  <ExternalLink className="ml-2 w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">40</div>
                  <div className="text-sm text-gray-400">Max Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">48h</div>
                  <div className="text-sm text-gray-400">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">¥900K</div>
                  <div className="text-sm text-gray-400">Total Prizes</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Code className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Virtual City Hall
                  </h3>
                  <p className="text-gray-300">
                    Experience innovation in a virtual environment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Event Schedule</h2>
          <p className="text-gray-400 text-lg">
            Key dates and milestones for the hackathon
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {scheduleItems.map((item, index) => (
            <Card
              key={index}
              className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">
                      {item.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-purple-400 font-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    {item.time}
                  </div>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Prizes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prizes & Awards
          </h2>
          <p className="text-gray-400 text-lg">
            Compete for amazing prizes and recognition
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {prizes.map((prize, index) => (
            <Card
              key={index}
              className="bg-gray-800/50 border-gray-700 hover:scale-105 transition-all duration-300 group"
            >
              <CardHeader className="text-center pb-3">
                <div
                  className={`w-16 h-16 mx-auto rounded-full ${prize.color} flex items-center justify-center mb-4`}
                >
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">
                  {prize.place}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {prize.amount}
                </div>
                <p className="text-gray-400">Cash Prize + Mentorship</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Location & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Event Details</h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-white font-medium">
                    Virtual Naruto City Hall
                  </div>
                  <div className="text-gray-400">Chugoku & Shikoku Region</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-white font-medium">Target Audience</div>
                  <div className="text-gray-400">
                    Students (Middle School - Graduate Level)
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Code className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-white font-medium">Theme</div>
                  <div className="text-gray-400">
                    Smart City Solutions & Social Impact
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Ready to Join?</CardTitle>
              <CardDescription className="text-gray-400">
                Register now and be part of an amazing innovation journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg">
                Start Registration
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <div className="text-center text-sm text-gray-400">
                Registration opens in 74 days
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventPage;

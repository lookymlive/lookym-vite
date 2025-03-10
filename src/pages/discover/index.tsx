
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Navbar } from "@/components/layout/Navbar";
import { VideoCard, VideoData } from "@/components/videos/VideoCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { motion } from "framer-motion";

const DiscoverPage = () => {
  const { user } = useSupabaseAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Mock data for demonstration
  const mockVideos: VideoData[] = [
    {
      id: "1",
      title: "Top 10 Summer Fashion Trends for 2023",
      thumbnailUrl: "https://picsum.photos/seed/1/800/450",
      duration: 325,
      views: 12500,
      createdAt: "2023-05-12T10:30:00Z",
      merchant: {
        id: "m1",
        name: "Fashion Forward",
        avatarUrl: "https://picsum.photos/seed/m1/200/200",
      },
      likes: 330,
      comments: 42,
    },
    {
      id: "2",
      title: "Must-Have Kitchen Gadgets for Home Cooks",
      thumbnailUrl: "https://picsum.photos/seed/2/800/450",
      duration: 485,
      views: 8700,
      createdAt: "2023-05-10T14:45:00Z",
      merchant: {
        id: "m2",
        name: "Kitchen Pro",
        avatarUrl: "https://picsum.photos/seed/m2/200/200",
      },
      likes: 215,
      comments: 28,
    },
    {
      id: "3",
      title: "Budget-Friendly Home Decor Ideas",
      thumbnailUrl: "https://picsum.photos/seed/3/800/450",
      duration: 412,
      views: 15300,
      createdAt: "2023-05-08T09:15:00Z",
      merchant: {
        id: "m3",
        name: "Home Style",
        avatarUrl: "https://picsum.photos/seed/m3/200/200",
      },
      likes: 420,
      comments: 56,
    },
    {
      id: "4",
      title: "Tech Reviews: Latest Smartphones Comparison",
      thumbnailUrl: "https://picsum.photos/seed/4/800/450",
      duration: 635,
      views: 23500,
      createdAt: "2023-05-05T16:20:00Z",
      merchant: {
        id: "m4",
        name: "Tech Guru",
        avatarUrl: "https://picsum.photos/seed/m4/200/200",
      },
      likes: 580,
      comments: 87,
    },
    {
      id: "5",
      title: "Easy 15-Minute Workout Routines",
      thumbnailUrl: "https://picsum.photos/seed/5/800/450",
      duration: 247,
      views: 9800,
      createdAt: "2023-05-03T08:40:00Z",
      merchant: {
        id: "m5",
        name: "Fitness First",
        avatarUrl: "https://picsum.photos/seed/m5/200/200",
      },
      likes: 310,
      comments: 34,
    },
    {
      id: "6",
      title: "Skincare Routine for Sensitive Skin",
      thumbnailUrl: "https://picsum.photos/seed/6/800/450",
      duration: 378,
      views: 11200,
      createdAt: "2023-05-01T11:10:00Z",
      merchant: {
        id: "m6",
        name: "Beauty Basics",
        avatarUrl: "https://picsum.photos/seed/m6/200/200",
      },
      likes: 290,
      comments: 45,
    },
  ];

  // In a real app, this would fetch from Supabase
  const { data: videos, isLoading } = useQuery({
    queryKey: ["discover-videos"],
    queryFn: async () => {
      // This would be replaced with actual Supabase fetch
      return mockVideos;
    },
  });

  const categories = [
    { id: "all", name: "All" },
    { id: "fashion", name: "Fashion" },
    { id: "tech", name: "Technology" },
    { id: "home", name: "Home & Decor" },
    { id: "beauty", name: "Beauty" },
    { id: "fitness", name: "Fitness" },
    { id: "food", name: "Food" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger a search query
    console.log("Searching for:", searchQuery);
  };

  const filteredVideos = videos || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Discover Videos</h1>
          <p className="text-muted-foreground">
            Explore the latest shopping videos from top creators
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </form>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="mb-4 flex overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                onClick={() => setActiveCategory(category.id)}
                className="px-4"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-video bg-muted rounded-xl mb-3"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map((video, index) => (
                    <VideoCard key={video.id} video={video} index={index} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default DiscoverPage;

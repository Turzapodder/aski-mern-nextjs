"use client";

import { useState } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function TutorProfilePage() {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start gap-6 p-6">
          <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-neutral-200">
            <Image
              src="/assets/tutor-profile.svg"
              alt="Tutor Profile"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-500 text-sm">#2</span>
              <h1 className="text-2xl font-bold">Nguyen Shane</h1>
            </div>
            <p className="text-gray-700 mb-4">
              Passionate Software Engineer Crafting Innovative Solutions
            </p>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-gray-600 text-sm">Speaks:</span>
              <span className="text-gray-800 text-sm">English</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">NATIVE</span>
              <span className="text-gray-800 text-sm">Spanish</span>
              <span className="text-gray-800 text-sm">Turkish</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-green-50 text-green-800 px-3 py-2 rounded-full">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">A</div>
                <div>
                  <div className="text-sm font-medium">A highly rated and experienced tutor</div>
                  <div className="text-xs uppercase">SUPER TUTOR</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-red-50 text-red-800 px-3 py-2 rounded-full">
                <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">%</div>
                <div>
                  <div className="text-sm font-medium">Top 1%</div>
                  <div className="text-xs uppercase">ENGLISH TUTOR</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="border-b w-full justify-start rounded-none gap-8 px-6">
            <TabsTrigger value="about" className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none">About</TabsTrigger>
            <TabsTrigger value="work" className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none">Work experience</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none">Reviews (30)</TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none">Education</TabsTrigger>
            <TabsTrigger value="availability" className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none">Availability</TabsTrigger>
          </TabsList>

          {/* About Tab Content */}
          <TabsContent value="about" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-xl font-bold mb-4">About Me</h2>
                <div className="text-gray-700">
                  <p>
                    Greetings, fellow software enthusiasts! I&apos;m thrilled to see your interest in exploring
                    my profile. I&apos;m Nguyen Shane, a 24-year-old software engineer from the United
                    Kingdom. My educational path led me to earn a Bachelor&apos;s Degree in Computer
                    Science, specializing in Software Engineering. With this qualification, I&apos;m equipped
                    to dive deep into the world of coding and development, ready to tackle exciting
                    projects and contribute to cutting-edge technological advancements...
                  </p>
                  {showMore && (
                    <ul className="list-disc pl-5 mt-4 space-y-2">
                      <li>Over 5 years of professional software development experience</li>
                      <li>Specialized in full-stack web development with React and Node.js</li>
                      <li>Passionate about teaching and mentoring junior developers</li>
                      <li>Contributed to open-source projects in the JavaScript ecosystem</li>
                      <li>Experienced in building scalable and maintainable software solutions</li>
                    </ul>
                  )}
                </div>
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="text-blue-600 hover:underline mt-4"
                >
                  {showMore ? "See less" : "See more"}
                </button>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Tutor Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500 text-sm">PROFESSION</p>
                    <p className="text-gray-800">Software Engineer at TechInnovate Ltd</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">EDUCATION</p>
                    <p className="text-gray-800">BSc in Computer Science</p>
                    <a href="https://university.edu/profile/nguyen-shane" className="text-blue-600 hover:underline text-sm">
                      University Profile Link
                    </a>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">EXPERIENCE</p>
                    <p className="text-gray-800">5+ years in software development</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">TEACHING SUBJECTS</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="bg-gray-100">JavaScript</Badge>
                      <Badge variant="outline" className="bg-gray-100">React</Badge>
                      <Badge variant="outline" className="bg-gray-100">Node.js</Badge>
                      <Badge variant="outline" className="bg-gray-100">Python</Badge>
                      <Badge variant="outline" className="bg-gray-100">Data Structures</Badge>
                      <Badge variant="outline" className="bg-gray-100">Algorithms</Badge>
                      <Badge variant="outline" className="bg-gray-100">Web Development</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Other Tab Contents with Dummy Data */}
          <TabsContent value="work" className="p-6">
            <h2 className="text-xl font-bold mb-4">Work Experience</h2>
            <p className="text-gray-700">Work experience content will be displayed here.</p>
          </TabsContent>

          <TabsContent value="reviews" className="p-6">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            <p className="text-gray-700">Reviews content will be displayed here.</p>
          </TabsContent>

          <TabsContent value="education" className="p-6">
            <h2 className="text-xl font-bold mb-4">Education</h2>
            <p className="text-gray-700">Education content will be displayed here.</p>
          </TabsContent>

          <TabsContent value="availability" className="p-6">
            <h2 className="text-xl font-bold mb-4">Availability</h2>
            <p className="text-gray-700">Availability content will be displayed here.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, MapPin, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Match {
   id: number;
   date: string;
   venue: {
      name: string;
      city: string;
      capacity: number;
   };
   series: {
      name: string;
      year: number;
   };
   teams: {
      team1: {
         id: number;
         name: string;
         short_name: string;
         logo_url: string;
      };
      team2: {
         id: number;
         name: string;
         short_name: string;
         logo_url: string;
      };
   };
   result: {
      winner: {
         id: number;
         name: string;
         short_name: string;
      } | null;
      margin: string;
      type: string;
   };
   officials: {
      umpire1: string;
      umpire2: string;
   };
   toss: {
      winner_id: number;
      decision: string;
   };
}

interface BattingCard {
   id: number;
   player_id: number;
   player_name: string;
   batting_style: string;
   team_name: string;
   team_short: string;
   runs_scored: number;
   balls_faced: number;
   fours: number;
   sixes: number;
   dismissal_type: string;
   batting_order: number;
}

interface BowlingCard {
   id: number;
   player_id: number;
   player_name: string;
   bowling_style: string;
   team_name: string;
   team_short: string;
   overs_bowled: number;
   runs_conceded: number;
   wickets_taken: number;
   economy_rate: number;
}

interface MatchData {
   match: Match;
   scorecards: {
      batting: {
         team1: BattingCard[];
         team2: BattingCard[];
      };
      bowling: {
         team1: BowlingCard[];
         team2: BowlingCard[];
      };
   };
}

export default function MatchDetailPage() {
   const params = useParams();
   const [matchData, setMatchData] = useState<MatchData | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchMatch = async () => {
         try {
            const response = await fetch(`/api/matches/${params.id}`);
            if (!response.ok) {
               throw new Error("Failed to fetch match data");
            }
            const data = await response.json();
            setMatchData(data);
         } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
         } finally {
            setLoading(false);
         }
      };

      if (params.id) {
         fetchMatch();
      }
   }, [params.id]);

   if (loading) {
      return (
         <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-64">
               <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading match details...</p>
               </div>
            </div>
         </div>
      );
   }

   if (error || !matchData) {
      return (
         <div className="container mx-auto px-4 py-8">
            <div className="text-center">
               <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
               <p className="text-gray-600 mb-4">
                  {error || "Match not found"}
               </p>
               <Button asChild>
                  <Link href="/matches">Back to Matches</Link>
               </Button>
            </div>
         </div>
      );
   }

   const { match, scorecards } = matchData;

   const calculateTeamTotal = (battingCards: BattingCard[]) => {
      return battingCards.reduce((total, card) => total + card.runs_scored, 0);
   };

   const calculateTeamWickets = (battingCards: BattingCard[]) => {
      return battingCards.filter(
         (card) => card.dismissal_type && card.dismissal_type !== "not out"
      ).length;
   };

   const team1Total = calculateTeamTotal(scorecards.batting.team1);
   const team1Wickets = calculateTeamWickets(scorecards.batting.team1);
   const team2Total = calculateTeamTotal(scorecards.batting.team2);
   const team2Wickets = calculateTeamWickets(scorecards.batting.team2);

   return (
      <div className="container mx-auto px-4 py-8">
         {/* Match Header */}
         <Card className="mb-8">
            <CardHeader>
               <div className="flex items-center justify-between">
                  <div>
                     <CardTitle className="text-2xl mb-2">
                        {match.series.name} {match.series.year}
                     </CardTitle>
                     <div className="flex items-center text-gray-600 space-x-4">
                        <div className="flex items-center">
                           <CalendarDays className="h-4 w-4 mr-1" />
                           {new Date(match.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                           <MapPin className="h-4 w-4 mr-1" />
                           {match.venue.name}, {match.venue.city}
                        </div>
                     </div>
                  </div>
                  {match.result.winner && (
                     <Badge variant="secondary" className="text-lg px-4 py-2">
                        <Trophy className="h-4 w-4 mr-2" />
                        {match.result.winner.name} won by {match.result.margin}
                     </Badge>
                  )}
               </div>
            </CardHeader>
            <CardContent>
               {/* Teams and Scores */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  {/* Team 1 */}
                  <div className="text-center">
                     <div className="flex items-center justify-center mb-4">
                        {match.teams.team1.logo_url && (
                           <Image
                              src={match.teams.team1.logo_url}
                              alt={match.teams.team1.name}
                              width={60}
                              height={60}
                              className="mr-4"
                           />
                        )}
                        <div>
                           <h3 className="text-xl font-bold">
                              {match.teams.team1.name}
                           </h3>
                           <p className="text-gray-600">
                              {match.teams.team1.short_name}
                           </p>
                        </div>
                     </div>
                     <div className="text-3xl font-bold text-blue-600">
                        {team1Total}/{team1Wickets}
                     </div>
                  </div>

                  {/* VS */}
                  <div className="flex items-center justify-center">
                     <div className="text-2xl font-bold text-gray-400">VS</div>
                  </div>

                  {/* Team 2 */}
                  <div className="text-center md:col-start-2">
                     <div className="flex items-center justify-center mb-4">
                        {match.teams.team2.logo_url && (
                           <Image
                              src={match.teams.team2.logo_url}
                              alt={match.teams.team2.name}
                              width={60}
                              height={60}
                              className="mr-4"
                           />
                        )}
                        <div>
                           <h3 className="text-xl font-bold">
                              {match.teams.team2.name}
                           </h3>
                           <p className="text-gray-600">
                              {match.teams.team2.short_name}
                           </p>
                        </div>
                     </div>
                     <div className="text-3xl font-bold text-blue-600">
                        {team2Total}/{team2Wickets}
                     </div>
                  </div>
               </div>

               {/* Match Info */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                     <strong>Venue:</strong> {match.venue.name},{" "}
                     {match.venue.city}
                  </div>
                  <div>
                     <strong>Capacity:</strong>{" "}
                     {match.venue.capacity?.toLocaleString()}
                  </div>
                  <div>
                     <strong>Officials:</strong> {match.officials.umpire1},{" "}
                     {match.officials.umpire2}
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Scorecards */}
         <Tabs defaultValue="batting" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger value="batting">Batting Scorecards</TabsTrigger>
               <TabsTrigger value="bowling">Bowling Scorecards</TabsTrigger>
            </TabsList>

            <TabsContent value="batting" className="space-y-6">
               {/* Team 1 Batting */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center">
                        {match.teams.team1.logo_url && (
                           <Image
                              src={match.teams.team1.logo_url}
                              alt={match.teams.team1.name}
                              width={32}
                              height={32}
                              className="mr-3"
                           />
                        )}
                        {match.teams.team1.name} Batting
                        <Badge variant="outline" className="ml-4">
                           {team1Total}/{team1Wickets}
                        </Badge>
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                           <thead>
                              <tr className="border-b">
                                 <th className="text-left py-2">Player</th>
                                 <th className="text-right py-2">Runs</th>
                                 <th className="text-right py-2">Balls</th>
                                 <th className="text-right py-2">4s</th>
                                 <th className="text-right py-2">6s</th>
                                 <th className="text-right py-2">SR</th>
                                 <th className="text-left py-2">Dismissal</th>
                              </tr>
                           </thead>
                           <tbody>
                              {scorecards.batting.team1.map((player) => (
                                 <tr key={player.id} className="border-b">
                                    <td className="py-2">
                                       <Link
                                          href={`/players/${player.player_id}`}
                                          className="hover:text-blue-600"
                                       >
                                          {player.player_name}
                                       </Link>
                                    </td>
                                    <td className="text-right">
                                       {player.runs_scored}
                                    </td>
                                    <td className="text-right">
                                       {player.balls_faced}
                                    </td>
                                    <td className="text-right">
                                       {player.fours}
                                    </td>
                                    <td className="text-right">
                                       {player.sixes}
                                    </td>
                                    <td className="text-right">
                                       {player.balls_faced > 0
                                          ? (
                                               (player.runs_scored /
                                                  player.balls_faced) *
                                               100
                                            ).toFixed(1)
                                          : "0.0"}
                                    </td>
                                    <td className="text-left">
                                       {player.dismissal_type || "not out"}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </CardContent>
               </Card>

               {/* Team 2 Batting */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center">
                        {match.teams.team2.logo_url && (
                           <Image
                              src={match.teams.team2.logo_url}
                              alt={match.teams.team2.name}
                              width={32}
                              height={32}
                              className="mr-3"
                           />
                        )}
                        {match.teams.team2.name} Batting
                        <Badge variant="outline" className="ml-4">
                           {team2Total}/{team2Wickets}
                        </Badge>
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                           <thead>
                              <tr className="border-b">
                                 <th className="text-left py-2">Player</th>
                                 <th className="text-right py-2">Runs</th>
                                 <th className="text-right py-2">Balls</th>
                                 <th className="text-right py-2">4s</th>
                                 <th className="text-right py-2">6s</th>
                                 <th className="text-right py-2">SR</th>
                                 <th className="text-left py-2">Dismissal</th>
                              </tr>
                           </thead>
                           <tbody>
                              {scorecards.batting.team2.map((player) => (
                                 <tr key={player.id} className="border-b">
                                    <td className="py-2">
                                       <Link
                                          href={`/players/${player.player_id}`}
                                          className="hover:text-blue-600"
                                       >
                                          {player.player_name}
                                       </Link>
                                    </td>
                                    <td className="text-right">
                                       {player.runs_scored}
                                    </td>
                                    <td className="text-right">
                                       {player.balls_faced}
                                    </td>
                                    <td className="text-right">
                                       {player.fours}
                                    </td>
                                    <td className="text-right">
                                       {player.sixes}
                                    </td>
                                    <td className="text-right">
                                       {player.balls_faced > 0
                                          ? (
                                               (player.runs_scored /
                                                  player.balls_faced) *
                                               100
                                            ).toFixed(1)
                                          : "0.0"}
                                    </td>
                                    <td className="text-left">
                                       {player.dismissal_type || "not out"}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="bowling" className="space-y-6">
               {/* Team 2 Bowling (bowled to Team 1) */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center">
                        {match.teams.team2.logo_url && (
                           <Image
                              src={match.teams.team2.logo_url}
                              alt={match.teams.team2.name}
                              width={32}
                              height={32}
                              className="mr-3"
                           />
                        )}
                        {match.teams.team2.name} Bowling
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                           <thead>
                              <tr className="border-b">
                                 <th className="text-left py-2">Player</th>
                                 <th className="text-right py-2">Overs</th>
                                 <th className="text-right py-2">Runs</th>
                                 <th className="text-right py-2">Wickets</th>
                                 <th className="text-right py-2">Economy</th>
                              </tr>
                           </thead>
                           <tbody>
                              {scorecards.bowling.team1.map((player) => (
                                 <tr key={player.id} className="border-b">
                                    <td className="py-2">
                                       <Link
                                          href={`/players/${player.player_id}`}
                                          className="hover:text-blue-600"
                                       >
                                          {player.player_name}
                                       </Link>
                                    </td>
                                    <td className="text-right">
                                       {player.overs_bowled}
                                    </td>
                                    <td className="text-right">
                                       {player.runs_conceded}
                                    </td>
                                    <td className="text-right">
                                       {player.wickets_taken}
                                    </td>
                                    <td className="text-right">
                                       {player.economy_rate.toFixed(2)}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </CardContent>
               </Card>

               {/* Team 1 Bowling (bowled to Team 2) */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center">
                        {match.teams.team1.logo_url && (
                           <Image
                              src={match.teams.team1.logo_url}
                              alt={match.teams.team1.name}
                              width={32}
                              height={32}
                              className="mr-3"
                           />
                        )}
                        {match.teams.team1.name} Bowling
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                           <thead>
                              <tr className="border-b">
                                 <th className="text-left py-2">Player</th>
                                 <th className="text-right py-2">Overs</th>
                                 <th className="text-right py-2">Runs</th>
                                 <th className="text-right py-2">Wickets</th>
                                 <th className="text-right py-2">Economy</th>
                              </tr>
                           </thead>
                           <tbody>
                              {scorecards.bowling.team2.map((player) => (
                                 <tr key={player.id} className="border-b">
                                    <td className="py-2">
                                       <Link
                                          href={`/players/${player.player_id}`}
                                          className="hover:text-blue-600"
                                       >
                                          {player.player_name}
                                       </Link>
                                    </td>
                                    <td className="text-right">
                                       {player.overs_bowled}
                                    </td>
                                    <td className="text-right">
                                       {player.runs_conceded}
                                    </td>
                                    <td className="text-right">
                                       {player.wickets_taken}
                                    </td>
                                    <td className="text-right">
                                       {player.economy_rate.toFixed(2)}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>
         </Tabs>

         {/* Back Button */}
         <div className="mt-8">
            <Button asChild variant="outline">
               <Link href="/matches">← Back to Matches</Link>
            </Button>
         </div>
      </div>
   );
}

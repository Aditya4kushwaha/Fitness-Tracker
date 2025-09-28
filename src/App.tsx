import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Progress } from './components/ui/progress';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { PlusCircle, Zap, TrendingUp, Flame, Footprints, Trash2 } from 'lucide-react';

// --- MOCK DATA & TYPES ---
const workoutTypes = ['Running', 'Cycling', 'Yoga', 'Gym', 'Cardio', 'Sports'] as const;

interface Workout {
  id: number;
  date: string; // "YYYY-MM-DD"
  type: typeof workoutTypes[number];
  duration: number; // in minutes
  calories: number;
  steps?: number;
}

const initialWorkouts: Workout[] = [
  { id: 1, date: '2025-09-22', type: 'Gym', duration: 45, calories: 300, steps: 1000 },
  { id: 2, date: '2025-09-23', type: 'Cardio', duration: 60, calories: 800, steps : 3000 },
  { id: 3, date: '2025-09-24', type: 'Sports', duration: 30, calories: 400, steps : 500 },
];

const weeklyGoal = 300; 


const formatDate = (dateStr: string) => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};


const App: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWorkoutType, setNewWorkoutType] = useState<Workout['type']>('Running');

  
  const totalMinutesThisWeek = workouts.reduce((sum, w) => sum + w.duration, 0);
  const totalCaloriesThisWeek = workouts.reduce((sum, w) => sum + w.calories, 0);
  const totalStepsThisWeek = workouts.reduce((sum, w) => sum + (w.steps || 0), 0);
  const goalProgress = Math.min((totalMinutesThisWeek / weeklyGoal) * 100, 100);


  const chartData = workouts.map(w => ({
    name: formatDate(w.date),
    duration: w.duration,
    calories: w.calories,
  })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

  const handleAddWorkout = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const newWorkout: Workout = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: newWorkoutType, // Use state for the select component
      duration: Number(formData.get('duration')),
      calories: Number(formData.get('calories')),
      steps: formData.get('steps') ? Number(formData.get('steps')) : undefined,
    };
    setWorkouts([...workouts, newWorkout]);
    setIsDialogOpen(false);
  };

  const handleDeleteWorkout = (idToDelete: number) => {
    setWorkouts(workouts.filter(workout => workout.id !== idToDelete));
  };

  const sortedWorkouts = workouts.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen w-full relative bg-black text-white">
     
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000",
        }}
      />
   
  
      <div className="relative z-10 max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">

        {/* --- HEADER --- */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Good Morning !</h1>
              <p className="text-gray-400 text-sm sm:text-base">Ready to crush your goals today ? 🔥</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto cursor-pointer">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Workout
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Workout</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddWorkout} className="grid gap-4 py-4">
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Type</Label>
                  <Select value={newWorkoutType} onValueChange={(value) => setNewWorkoutType(value as Workout['type'])}>
                      <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a workout" />
                      </SelectTrigger>
                      <SelectContent>
                          {workoutTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">Duration (min)</Label>
                  <Input id="duration" name="duration" type="number" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="calories" className="text-right">Calories</Label>
                  <Input id="calories" name="calories" type="number" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="steps" className="text-right">Steps</Label>
                  <Input id="steps" name="steps" type="number" className="col-span-3" />
                </div>
                <Button type="submit" className="mt-4">Save Workout</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* --- STATS CARDS --- */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMinutesThisWeek}</div>
              <p className="text-xs text-muted-foreground">/ {weeklyGoal} min goal</p>
              <Progress value={goalProgress} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCaloriesThisWeek.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">kcal this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Steps</CardTitle>
              <Footprints className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStepsThisWeek.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Days</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workouts.length} / 7</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* --- CHARTS --- */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Workout Duration (Minutes)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-600" />
                  <XAxis dataKey="name" stroke="#a0a0a0" fontSize={12} />
                  <YAxis stroke="#a0a0a0" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="duration" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Calories Burned</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-600" />
                  <XAxis dataKey="name" stroke="#a0a0a0" fontSize={12} />
                  <YAxis stroke="#a0a0a0" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="calories" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* --- RECENT ACTIVITY SECTION --- */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Duration (min)</TableHead>
                    <TableHead className="text-right">Calories</TableHead>
                    <TableHead className="text-right">Steps</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedWorkouts.map((workout) => (
                    <TableRow key={workout.id}>
                      <TableCell>{formatDate(workout.date)}</TableCell>
                      <TableCell className="font-medium">{workout.type}</TableCell>
                      <TableCell className="text-right">{workout.duration}</TableCell>
                      <TableCell className="text-right">{workout.calories.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{workout.steps ? workout.steps.toLocaleString() : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteWorkout(workout.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {sortedWorkouts.map((workout) => (
                 <Card key={workout.id} className="bg-gray-800/50">
                    <CardContent className="p-4 flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-bold text-white">{workout.type}</p>
                        <p className="text-sm text-gray-400">{formatDate(workout.date)}</p>
                        <p className="text-sm text-gray-300">
                          {workout.duration} min &bull; {workout.calories.toLocaleString()} kcal {workout.steps && `• ${workout.steps.toLocaleString()} steps`}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteWorkout(workout.id)}>
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    </CardContent>
                 </Card>
              ))}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default App;


import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { Habit, removeHabit, toggleHabit } from "../store/habit-slice";
import { RootState, AppDispatch } from "../store/store";
import { useNotification } from "../hooks/useNotification";

const HabitList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "frequency">("name");
  const [filterFrequency, setFilterFrequency] = useState<
    "all" | "daily" | "weekly"
  >("all");
  const [filteredHabits, setFilteredHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const habits = useSelector((state: RootState) => state.habits.habits);
  const dispatch = useDispatch<AppDispatch>();
  const { notify } = useNotification();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    let sortedHabits = habits.filter((habit) =>
      habit.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterFrequency !== "all") {
      sortedHabits = sortedHabits.filter(
        (habit) => habit.frequency === filterFrequency
      );
    }

    if (sortBy === "name") {
      sortedHabits.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "frequency") {
      sortedHabits.sort((a, b) => a.frequency.localeCompare(b.frequency));
    }

    setFilteredHabits(sortedHabits);
  }, [searchTerm, habits, sortBy, filterFrequency]);

  useEffect(() => {
    filteredHabits.forEach((habit) => {
      if (!habit.completedDates.includes(today)) {
        notify("Habit Reminder", {
          body: `Don't forget to complete your habit: ${habit.name}`,
        });
      }
    });
  }, [filteredHabits, today, notify]);

  const getStreak = (habit: Habit) => {
    let streak = 0;
    const currentDate = new Date();

    while (true) {
      const dateString = currentDate.toISOString().split("T")[0];
      if (habit.completedDates.includes(dateString)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const handleToggleHabit = (habitId: string) => {
    dispatch(toggleHabit({ id: habitId, date: today }));
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      const isCompleted = habit.completedDates.includes(today);
      notify(isCompleted ? "Habit Completed" : "Habit Incomplete", {
        body: `Habit "${habit.name}" has been ${
          isCompleted ? "completed" : "marked as incomplete"
        }.`,
      });
    }
  };

  const handleOpenDialog = (habit: Habit) => {
    setSelectedHabit(habit);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedHabit(null);
    setOpenDialog(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4 }}>
      <TextField
        label="Search Habits"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "name" | "frequency")}
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="frequency">Frequency</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Filter By Frequency</InputLabel>
        <Select
          value={filterFrequency}
          onChange={(e) =>
            setFilterFrequency(e.target.value as "all" | "daily" | "weekly")
          }
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
        </Select>
      </FormControl>
      {filteredHabits.map((habit) => (
        <Paper key={habit.id} elevation={2} sx={{ p: 2 }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">{habit.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {habit.frequency.charAt(0).toUpperCase() +
                  habit.frequency.slice(1)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button
                  variant="outlined"
                  color={
                    habit.completedDates.includes(today) ? "success" : "primary"
                  }
                  onClick={() => handleToggleHabit(habit.id)}
                  startIcon={<CheckCircleIcon />}
                >
                  {habit.completedDates.includes(today)
                    ? "Completed"
                    : "Mark Complete"}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    dispatch(removeHabit(habit.id));
                    notify("Habit Removed", {
                      body: `Habit "${habit.name}" has been removed.`,
                    });
                  }}
                  startIcon={<DeleteIcon />}
                >
                  Remove
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleOpenDialog(habit)}
                >
                  View Details
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              Current Streak: {getStreak(habit)} days
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(getStreak(habit) / 30) * 100}
              sx={{ mt: 1 }}
            />
          </Box>
        </Paper>
      ))}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          Habit Details
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseDialog}
            aria-label="close"
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedHabit && (
            <Box>
              <Typography variant="h6">{selectedHabit.name}</Typography>
              <Typography variant="body1">
                Frequency: {selectedHabit.frequency}
              </Typography>
              <Typography variant="body2">
                Completed Dates:
                <ul>
                  {selectedHabit.completedDates.map((date) => (
                    <li key={date}>{date}</li>
                  ))}
                </ul>
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default HabitList;

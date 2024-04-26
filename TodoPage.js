import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, StatusBar, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TodoPage = () => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [dueDate, setDueDate] = useState(new Date());
  const [dueTime, setDueTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [remainingChars, setRemainingChars] = useState(100); // Initial max character count
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load dark mode state from AsyncStorage
    AsyncStorage.getItem('darkMode')
      .then(value => {
        if (value !== null) {
          setDarkMode(JSON.parse(value));
        }
      })
      .catch(error => console.error('Error loading dark mode state:', error));
    // Load tasks from AsyncStorage when component mounts
    loadTasks();
  }, []);  

  useEffect(() => {
    // Save tasks to AsyncStorage whenever tasks state changes
    saveTasks();
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks !== null) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const addTask = () => {
    if (task.trim() !== '') {
      // Check if both dueDate and dueTime are set
      if (dueDate && dueTime) {
        const timestamp = Date.now(); // Unique identifier for the task
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
        // Formatting the dueDate
        const formattedDate = `${days[dueDate.getDay()]}, ${months[dueDate.getMonth()]} ${dueDate.getDate()}, ${dueDate.getFullYear()}`;
  
        const newTask = {
          id: timestamp,
          text: task,
          completed: false,
          dueDate: formattedDate,
          dueTime: dueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        // Add the new task at the beginning of the tasks array
        setTasks([newTask, ...tasks]);
        setTask('');
        // Reset date and time pickers to current date and time
        setDueDate(new Date());
        setDueTime(new Date());
        // Reset remaining character count
        setRemainingChars(100);
      } else {
        // Alert the user or handle the situation when date or time is not selected
        console.log("Please select both date and time for the task.");
      }
    }
  };

  const handleTaskChange = (text) => {
    setTask(text);
    const remaining = 100 - text.length;
    setRemainingChars(remaining >= 0 ? remaining : 0);
  };

  const toggleTaskCompletion = (id) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const removeTask = (id) => {
    const filteredTasks = tasks.filter(task => task.id !== id);
    setTasks(filteredTasks);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(false);
    setDueDate(currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || dueTime;
    setShowTimePicker(false);
    setDueTime(currentTime);
  };

  const toggleDarkMode = () => {
    const newDarkModeState = !darkMode;
    setDarkMode(newDarkModeState);
    // Save the dark mode state to AsyncStorage
    AsyncStorage.setItem('darkMode', JSON.stringify(newDarkModeState))
      .catch(error => console.error('Error saving dark mode state:', error));
  };  

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <StatusBar backgroundColor={darkMode ? '#222' : '#C0D6E8'} barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.titleContainer}>
        <Text style={[styles.title, darkMode && styles.darkTitle]}>Todo App</Text>
        <View style={styles.toggleContainer}>
        <Text style={[styles.darkModeText, { color: darkMode ? '#fff' : 'black' }]}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>
      </View>
      <FlatList
        data={tasks.slice().reverse()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItemContainer}>
            <View style={[styles.taskContainer, item.completed && styles.completedTask, darkMode && styles.darkTask]}>
              <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
                <Icon name={item.completed ? 'smile-o' : 'circle-o'} size={24} color={darkMode ? '#fff' : 'black'} style={styles.checkbox} />
              </TouchableOpacity>
              <View style={styles.taskTextContainer}>
                <Text style={[styles.taskText, { fontSize: 20, textDecorationLine: item.completed ? 'line-through' : 'none', color: darkMode ? '#fff' : 'black' }]}>
                  {item.text}
                </Text>
                <Text style={[styles.dateTime, { color: darkMode ? '#fff' : 'black' }]}>{!item.completed && `${item.dueDate} ${item.dueTime}`}</Text>
              </View>
              <TouchableOpacity onPress={() => removeTask(item.id)}>
                <Icon name="trash-o" size={20} style={styles.removeIcon} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter task"
          value={task}
          onChangeText={handleTaskChange}
          style={[styles.input, darkMode && styles.darkInput]}
          maxLength={100}
          placeholderTextColor={darkMode ? '#ccc' : '#666'}
        />
        <View style={styles.remainingCharsContainer}>
          <Text style={[styles.remainingChars, { color: darkMode ? '#fff' : 'black' }]}>
            {remainingChars}
          </Text>        
        </View>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Icon name="calendar" size={20} color={darkMode ? '#fff' : 'black'} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowTimePicker(true)}>
          <Icon name="clock-o" size={20} color={darkMode ? '#fff' : 'black'} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={addTask}>
          <Icon name="plus" size={20} color={darkMode ? '#fff' : 'black'} style={styles.addIcon} />
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={dueTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#C0D6E8',
  },
  darkContainer: {
    backgroundColor: '#222',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  darkTitle: {
    color: '#fff',
  },
  taskItemContainer:{
    paddingBottom: 10
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#E1F7F5',
  },
  darkTask: {
    backgroundColor: '#444',
  },
  completedTask: {
    backgroundColor: '#3DA5CE',
  },
  checkbox: {
    marginRight: 10,
    fontSize: 20,
    marginBottom: 16,
  },
  taskTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  removeIcon: {
    color: 'red',
    paddingRight: 3
  },
  taskText: {
    fontSize: 20,
    color: 'black',
  },
  dateTime: {
    fontSize: 14,
    color: 'black',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    borderRadius: 25,
    padding: 5, // Add padding for better appearance
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    marginRight: 10,
    paddingLeft: 10,
    color: 'black',
  },
  darkInput: {
    color: '#fff',
    borderColor: '#aaa',
  },
  remainingCharsContainer: {
    position: 'absolute',
    right: '40%', // Align it to the right side of the input container
    top: '90%', // Align it vertically in the middle of the input container
    transform: [{ translateY: -20 }], // Adjust vertically to center it properly
  },  
  remainingChars: {
    color: 'black',
  },
  addIcon: {
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
    marginLeft: 10,
  },
  darkModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  darkModeText: {
    marginRight: 10,
    color: '#fff',
    fontWeight:'500',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TodoPage;
import { Navigate, Route, Routes } from 'react-router-dom';
import { PopupWorkout } from './PopupWorkout';


export const PopupWorkoutRoutes = () => {
  return (
    <Routes>
      <Route path="popupWorkout" element={<PopupWorkout />} />
    </Routes>
  );
};
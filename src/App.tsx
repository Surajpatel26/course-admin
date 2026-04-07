import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RequireAdmin } from './components/RequireAdmin';
import { AdminLayout } from './components/layout/AdminLayout';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Courses } from './pages/Courses';
import { CourseEditor } from './pages/CourseEditor';
import { Blogs } from './pages/Blogs';
import { BlogEditor } from './pages/BlogEditor';
import { Testimonials } from './pages/Testimonials';
import { TestimonialEditor } from './pages/TestimonialEditor';
import { Contacts } from './pages/Contacts';
import { Users } from './pages/Users';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Overview />} />
          <Route path="users" element={<Users />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseEditor />} />
          <Route path="blog" element={<Blogs />} />
          <Route path="blog/:id" element={<BlogEditor />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="testimonials/:id" element={<TestimonialEditor />} />
          <Route path="contacts" element={<Contacts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

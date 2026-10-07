import { createBrowserRouter } from "react-router";
import App from "./App";
import { MusiciansView } from "@/features/musician/views/MusiciansView";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
        <App />
    ),

    errorElement: (
      <>
        <h1>Error Page</h1>
      </>
    ),
    children: [
      {
        index: true,
        element: <MusiciansView />,
      },
    ],
  },
]);

import { Button } from "@nextui-org/react";
import { IconCarOff } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

export const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
    <IconCarOff className="w-20 h-20 text-default-300" stroke={1.25} aria-hidden />
    <h1 className="text-2xl font-semibold">Page not found</h1>
    <p className="text-default-500 max-w-md">
      That page doesn't exist. It may have been removed, or the link may be
      wrong.
    </p>
    <Button as={Link} to="/vehicles" color="primary" className="mt-2">
      Back to My Vehicles
    </Button>
  </div>
);

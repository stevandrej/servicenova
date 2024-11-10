import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return 'Hello /_auth/dashboard!'
}

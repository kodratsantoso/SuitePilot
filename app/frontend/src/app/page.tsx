import { redirect } from 'next/navigation'

// Root redirects to project portfolio
export default function Home() {
  redirect('/projects')
}

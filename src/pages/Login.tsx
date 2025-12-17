import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function Login() {
  const { user, loading, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">FinTrack</h1>
          <p className="text-slate-600 mt-2">Gestiona tus finanzas personales</p>
        </div>

        <Button
          onClick={signInWithGoogle}
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading ? 'Cargando...' : 'Iniciar sesión con Google'}
        </Button>
      </div>
    </div>
  )
}

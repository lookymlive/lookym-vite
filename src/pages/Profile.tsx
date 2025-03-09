import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, userRole, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('Debes iniciar sesión para ver tu perfil');
      navigate('/auth/sign-in');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-lg">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const username = user.user_metadata?.name || user.email?.split('@')[0] || "Usuario";
  const avatarUrl = user.user_metadata?.avatar_url || "";
  const email = user.email || "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-8 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile sidebar */}
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl} alt={username} />
                      <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-2xl">{username}</CardTitle>
                  <CardDescription>{email}</CardDescription>
                  <div className="mt-2 inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {userRole === "merchant" ? "Vendedor" : "Usuario"}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Miembro desde</span>
                      <span>{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    {userRole === "merchant" && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Videos publicados</span>
                        <span>0</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Editar perfil
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Main content */}
            <div className="w-full md:w-2/3">
              <Tabs defaultValue="activity">
                <TabsList className="w-full">
                  <TabsTrigger value="activity" className="flex-1">Actividad</TabsTrigger>
                  {userRole === "merchant" ? (
                    <TabsTrigger value="videos" className="flex-1">Mis Videos</TabsTrigger>
                  ) : (
                    <TabsTrigger value="favorites" className="flex-1">Favoritos</TabsTrigger>
                  )}
                  <TabsTrigger value="settings" className="flex-1">Configuración</TabsTrigger>
                </TabsList>
                <TabsContent value="activity" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Actividad reciente</CardTitle>
                      <CardDescription>
                        Historial de tus interacciones en la plataforma
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        No hay actividad reciente para mostrar
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                {userRole === "merchant" ? (
                  <TabsContent value="videos" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Mis Videos</CardTitle>
                        <CardDescription>
                          Videos que has publicado en la plataforma
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                          No has publicado ningún video todavía
                        </div>
                        <div className="flex justify-center mt-4">
                          <Button onClick={() => navigate('/upload')}>
                            Subir nuevo video
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ) : (
                  <TabsContent value="favorites" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Videos favoritos</CardTitle>
                        <CardDescription>
                          Videos que has marcado como favoritos
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                          No has marcado ningún video como favorito
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
                <TabsContent value="settings" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración de la cuenta</CardTitle>
                      <CardDescription>
                        Administra las preferencias de tu cuenta
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-col space-y-2">
                          <h3 className="font-medium">Notificaciones</h3>
                          <p className="text-sm text-muted-foreground">
                            Configura tus preferencias de notificaciones
                          </p>
                          <div className="mt-2">
                            <Button variant="outline" disabled>
                              Configurar notificaciones
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <h3 className="font-medium">Privacidad</h3>
                          <p className="text-sm text-muted-foreground">
                            Administra la configuración de privacidad de tu cuenta
                          </p>
                          <div className="mt-2">
                            <Button variant="outline" disabled>
                              Configurar privacidad
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
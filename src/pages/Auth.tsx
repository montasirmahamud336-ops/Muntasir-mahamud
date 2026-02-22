import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { AnimatedSection } from "@/components/AnimatedSection";
import { GlowDivider } from "@/components/GlowDivider";
import { Card3D } from "@/components/Card3D";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2, Chrome } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const authSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  email: z.string().email("Please enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  confirmPassword: z.string().optional(),
});

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, signUp, signIn, signInWithGoogle } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const redirectTo = searchParams.get("redirect") || "/";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirectTo);
    }
  }, [user, navigate, redirectTo]);

  const validateForm = () => {
    try {
      const dataToValidate: z.input<typeof authSchema> = isLogin
        ? {
            email: formData.email,
            password: formData.password,
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          };

      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          setErrors({ confirmPassword: "Passwords do not match" });
          return false;
        }
      }
      
      authSchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    if (isLogin) {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        let message = "Invalid credentials. Please try again.";
        if (error.message.includes("Email not confirmed")) {
          message = "Please verify your email before signing in.";
        } else if (error.message.includes("Invalid login credentials")) {
          message = "Invalid email or password.";
        }
        toast({
          title: "Sign In Failed",
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome Back!",
          description: "You have successfully signed in.",
        });
        navigate(redirectTo);
      }
    } else {
      const { error } = await signUp(formData.email, formData.password, formData.name);
      if (error) {
        let message = "Failed to create account. Please try again.";
        if (error.message.includes("already registered")) {
          message = "This email is already registered. Try signing in instead.";
        }
        toast({
          title: "Sign Up Failed",
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account before signing in.",
        });
        setIsLogin(true);
      }
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    const { error } = await signInWithGoogle(redirectTo);
    if (error) {
      toast({
        title: "Google Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsGoogleLoading(false);
      return;
    }
  };

  return (
    <Layout>
      <section className="section pt-32 min-h-screen flex items-center">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto">
            <AnimatedSection>
              <div className="perspective">
                <Card3D>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mx-auto mb-4 glow-sm"
                    >
                      <User className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h1 className="text-3xl font-heading font-bold mb-2 text-3d">
                      {isLogin ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-muted-foreground">
                      {isLogin
                        ? "Sign in to access chat and exclusive features."
                        : "Join to connect and collaborate on projects."}
                    </p>
                  </div>

                  {/* Toggle */}
                  <div className="flex p-1 rounded-xl bg-muted/50 mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(true);
                        setErrors({});
                      }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isLogin
                          ? "bg-primary text-primary-foreground shadow-sm glow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(false);
                        setErrors({});
                      }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        !isLogin
                          ? "bg-primary text-primary-foreground shadow-sm glow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Your full name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="pl-11 bg-background/50 border-border/50 focus:border-primary"
                            required={!isLogin}
                          />
                        </div>
                        {errors.name && (
                          <p className="text-xs text-destructive mt-1">{errors.name}</p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="pl-11 bg-background/50 border-border/50 focus:border-primary"
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-destructive mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                          className="pl-11 pr-11 bg-background/50 border-border/50 focus:border-primary"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-destructive mt-1">{errors.password}</p>
                      )}
                    </div>

                    {!isLogin && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="pl-11 bg-background/50 border-border/50 focus:border-primary"
                            required={!isLogin}
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    )}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full btn-primary"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            {isLogin ? "Sign In" : "Create Account"}
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </Button>
                    </motion.div>

                    {isLogin && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGoogleSignIn}
                          disabled={isGoogleLoading || isLoading}
                          className="w-full border-border/70 bg-card/60 hover:bg-card/85"
                        >
                          {isGoogleLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Redirecting...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Chrome className="w-4 h-4" />
                              Continue with Google
                            </span>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <GlowDivider />
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </Card3D>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </Layout>
  );
}


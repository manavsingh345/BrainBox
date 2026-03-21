import { useState } from "react";
import { useAuth, useClerk } from "@clerk/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button2 } from "../component/UI/Button2";
import { Brain, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Features", href: "#feature" },
  { label: "How it Works", href: "#howitworks" },
  { label: "Pricing", href: "/pricing" },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();

  const handleLogin = () => {
    navigate("/signin");
  };

  const handleSinup = () => {
    navigate("/signup");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await signOut(() => navigate("/"));
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container px-4">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">BrainBox</span>
            </a>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              {isSignedIn ? (
                <>
                  <Button2 variant="ghost" size="sm" onClick={handleDashboard} className="cursor-pointer">
                    Dashboard
                  </Button2>
                  <Button2 variant="default" size="sm" onClick={() => void handleLogout()} className="cursor-pointer">
                    Logout
                  </Button2>
                </>
              ) : (
                <>
                  <Button2 variant="ghost" size="sm" onClick={handleLogin} className="cursor-pointer">
                    Log in
                  </Button2>
                  <Button2 variant="default" size="sm" onClick={handleSinup} className="cursor-pointer">
                    Get Started
                  </Button2>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="container px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {isSignedIn ? (
                  <>
                    <Button2 variant="ghost" className="justify-start" onClick={handleDashboard}>
                      Dashboard
                    </Button2>
                    <Button2 variant="default" onClick={() => void handleLogout()}>
                      Logout
                    </Button2>
                  </>
                ) : (
                  <>
                    <Button2 variant="ghost" className="justify-start" onClick={handleLogin}>
                      Log in
                    </Button2>
                    <Button2 variant="default" onClick={handleSinup}>
                      Get Started
                    </Button2>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

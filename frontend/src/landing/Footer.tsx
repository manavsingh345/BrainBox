import { Brain, Github, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="container px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          
          <div className="md:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-primary">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold">BrainBox</span>
            </a>
            <p className="text-muted-foreground text-sm max-w-xs mb-4">
              The auto-organizing AI knowledge base for everything you want to remember.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://x.com/ManavSingh321" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com/manavsingh345" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#feature" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} BrainBox. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

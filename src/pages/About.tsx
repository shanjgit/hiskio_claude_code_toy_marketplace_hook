import NavigationBar from "@/components/NavigationBar";
import * as Sentry from "@sentry/react";
import { useState } from "react";
import { checkForProfanity } from "@/utils/profanityFilter";

const About = () => {
  const [errorCount, setErrorCount] = useState(0);
  const [testText, setTestText] = useState("");

  const triggerError = () => {
    setErrorCount(prev => prev + 1);
    // Throw an intentional error for testing Sentry
    throw new Error(`Test error #${errorCount + 1} from About page`);
  };

  const triggerHandledError = () => {
    setErrorCount(prev => prev + 1);
    try {
      throw new Error(`Handled test error #${errorCount + 1} from About page`);
    } catch (error) {
      // Capture the error with Sentry
      Sentry.captureException(error);
      console.log("Error captured and sent to Sentry:", error);
    }
  };

  const addBreadcrumb = () => {
    Sentry.addBreadcrumb({
      message: "User clicked breadcrumb button",
      category: "user-action",
      level: "info",
    });
    console.log("Breadcrumb added to Sentry");
  };

  const setUserContext = () => {
    Sentry.setUser({
      id: "test-user-123",
      email: "test@example.com",
      username: "test-user",
    });
    console.log("User context set in Sentry");
  };

  const testProfanityDetection = () => {
    if (!testText.trim()) {
      console.log("Please enter some text to test");
      return;
    }
    
    const result = checkForProfanity(testText, { field: "test-field", userId: "test-user-123" });
    
    if (result.hasProfanity) {
      console.log("Profanity detected:", result.detectedWords);
      setErrorCount(prev => prev + 1);
    } else {
      console.log("No profanity detected in text");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="px-[var(--page-padding)] py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-display font-medium text-foreground mb-4">
            About Marketplace
          </h1>
          <p className="text-body text-foreground mb-4">
            Marketplace is your trusted platform for buying and selling authentic pre-owned products.
          </p>
          <p className="text-body text-foreground mb-6">
            We connect sellers with buyers in a safe, secure environment where quality and authenticity are guaranteed.
          </p>

          {/* Sentry Testing Section */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-medium text-foreground mb-4">
              Sentry Testing
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Test Sentry error tracking integration. Errors triggered: {errorCount}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={triggerError}
                className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                Trigger Unhandled Error
              </button>
              
              <button
                onClick={triggerHandledError}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Trigger Handled Error
              </button>
              
              <button
                onClick={addBreadcrumb}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Breadcrumb
              </button>
              
              <button
                onClick={setUserContext}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Set User Context
              </button>
            </div>
          </div>

          {/* Profanity Detection Testing Section */}
          <div className="border-t pt-6 mt-6">
            <h2 className="text-lg font-medium text-foreground mb-4">
              Profanity Detection Testing
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Test profanity detection with words like 'fuck', 'merder', etc.
            </p>
            
            <div className="space-y-3">
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter text to test for profanity (try: 'This is fucking awesome' or 'Murder is bad')"
                className="w-full px-4 py-3 border border-primary/30 rounded-md resize-none h-20 bg-background text-foreground placeholder:text-muted-foreground"
              />
              
              <button
                onClick={testProfanityDetection}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Test Profanity Detection
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
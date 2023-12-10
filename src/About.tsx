export function About() {
    return (
        <div
        key="footer"
        className="mt-10 ml-4 mr-10 text-gray-500 dark:text-gray-400 mb-10"
    >
        <div>
            <h1 className="text-2xl font-bold mt-5 text-gray-700">
                Introducing the <span className="text-orange-500 dark:text-blue-500">HAR File Sanitizer Tool </span>
                - Secure Troubleshooting Made Easy for Web-Related Issues!
            </h1>
            <p className="mt-2 dark:text-gray-400">
                When you encounter issues with websites, providing network traces becomes crucial for troubleshooting.
                However, these traces might contain sensitive info like passwords and API keys, posing security risks.
                The HAR Sanitizer tool sanitizes sensitive data providing the capability to hash or remove entirely from your network traces,
                ensuring your session cookies, authorization headers, and more stay private.
                It works using client-side logic to sanitize HAR files, allowing you to share troubleshooting data without compromising security.
                Embrace a worry-free online experience with our commitment to building a safer Digital Realm!
            </p>
        </div>
    </div>
    );
  }


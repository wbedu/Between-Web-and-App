# Between Web and App: A Comparative Analysis of Electron Applications and Their Website Counterparts
## Project Proposal


### Abstract
Electron, a popular framework for developing browser-based native applications, has become an in-demand framework for companies and developers to develop cross-platform apps with the familiarity of web technologies. Many websites today are already developed to be a single-page web app with development teams being well experienced in web frameworks. Thus, porting a web application to an Electron application is a sought-after venture to deliver a better experience to users with minimal team shifting. However, the Electron framework provides the developers a richer feature set, with the ability to perform OS-level operations, that a typical web application in a sandboxed browser environment cannot achieve. This could allow companies and developers to conduct more invasive fingerprinting strategies in their Electron applications that may not be found in their web counterparts. We strive to utilize automated pipelines to analyze the differences, if they exist, in third-party libraries used for fingerprinting and tracking between Electron apps and their web counterparts.

### Objectives
The primary goal of this project is to enhance Inspectron, a black box auditing tool, by implementing automation features for comprehensive testing and comparison of Electron applications and their conventional web browser counterparts. The objective is to potentially identify and analyze previously unexplored differences in vulnerabilities and misconfigurations between these two types of applications. The automated testing process will systematically assess the security posture of Electron applications, pinpointing potential risks and disparities not present in traditional web applications, and vice versa. The project aims to provide actionable insights that contribute to the improvement of security measures for both Electron and web applications.

### Methodology
For our evaluation, we aspire to evaluate ~50 Electron applications and their web app equivalents over the scope of this semester. Our hope is that our evaluation will highlight previously unexplored discrepancies between the two apps. Some possible highlighted areas of interest include third-party telemetry and ad libraries such as Sentry.io, DoubleClick.net, and Creteo. While our specific instrumenting methodology is pending code delivery of Inspectron, we believe that areas of focus include: cross context JavaScript execution, preloaded APIs and network requests. For our web app instrumentation, we plan to retrofit the Puppeteer components of Inspectron to aid with the instrumentation of our planned areas of focus. An initial crawling of these applications can be automated with the use of Inspectron and our Inspectron fork, with further crawling requiring manual interaction with the applications with predefined patterns and test user accounts (i.e. Slack, Discord, WordPress). Through this methodology, we aim to provide a comprehensive understanding of the unique characteristics and potential privacy concerns associated with Electron applications and their web app counterparts, thereby contributing to the broader discourse on application security and user privacy.

### Timeline
We plan on following the proposed timeline:
- Week 1: Finalize targeted application list.
- Weeks 3-4: Retrofit Inspectron.
- Week 5: Collect initial data.
- Week 6: Submit report with project update.
- Week 7: Manual crawling with predefined patterns and user accounts.
- Weeks 8-10: Data analysis and visualization. Investigate outliers found in analysis.
- Weeks 11/12: Final presentation and final paper.

### Appendix
**Initial list of considered applications:**
- Slack, [https://slack.com/](https://slack.com/)
- Discord, [https://discord.com/](https://discord.com/)
- WordPress, [https://wordpress.com/](https://wordpress.com/)
- GitHub (Desktop), [https://desktop.github.com/](https://desktop.github.com/)
- Skype, [https://www.skype.com/](https://www.skype.com/)
- Microsoft Teams, [https://teams.microsoft.com/](https://teams.microsoft.com/)
- Tidal, [https://tidal.com/](https://tidal.com/)
- Microsoft ToDo: [https://to-do.office.com/](https://to-do.office.com/)
- Trello: [https://trello.com/](https://trello.com/)
- WebTorrent: [https://webtorrent.io/](https://webtorrent.io/)
- Figma: [https://www.figma.com/](https://www.figma.com/)
- Splice: [https://splice.com/](https://splice.com/)
- Logsnag: [https://logsnag.com/](https://logsnag.com/)
- Agora: [https://agora.io](https://agora.io)
- Notion: [https://www.notion.so](https://www.notion.so)

**Initial list of target third-party libraries (not limited to this list):**
- Google Analytics: [https://analytics.google.com/analytics/academy/](https://analytics.google.com/analytics/academy/)
- Sentry.io: [https://sentry.io/welcome/](https://sentry.io/welcome/)
- DataDog: [https://www.datadoghq.com/](https://www.datadoghq.com/)
- Adobe Analytics: [https://business.adobe.com/products/analytics/adobe-analytics.html](https://business.adobe.com/products/analytics/adobe-analytics.html)
- CloudFlare Web Analytics: [https://www.cloudflare.com/web-analytics/](https://www.cloudflare.com/web-analytics/)

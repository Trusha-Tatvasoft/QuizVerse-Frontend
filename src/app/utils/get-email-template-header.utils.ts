export const getEmailTemplateHtml = (bodyContent: string): string => `
<div
    style="margin: auto; font-family: Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden">
    <div style="background: linear-gradient(135deg, rgba(117, 92, 207, 1), rgba(24, 1, 109, 1)); padding: 30px 0; text-align: center; color: rgba(255, 255, 255, 1)">
        <table align="center" cellpadding="0" cellspacing="0" style="margin: auto">
            <tbody>
                <tr>
                    <td style="padding-right: 12px">
                        <div style="display: inline-block; background: linear-gradient(135deg, rgba(147, 51, 234, 1), rgba(37, 99, 235, 1)); width: 52px; height: 52px; border-radius: 12px; font-weight: bold; color: rgba(255, 255, 255, 1); font-size: 24px; font-family: &quot;Roboto&quot;, sans-serif; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); line-height: 52px; text-align: center">
                            Q
                        </div>
                    </td>
                    <td style="text-align: left">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: rgba(255, 255, 255, 1)">
                            QuizVerse
                        </h1>
                        <p style="margin: 2px 0 0; font-size: 14px; opacity: 0.85; color: rgba(255, 255, 255, 1)">
                            AI-Powered Quiz Platform
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div style="background-color: rgba(255, 253, 255, 1); padding: 25px; color: rgba(51, 51, 51, 1)">
       ${bodyContent}
    </div>
    <div style="background: linear-gradient(135deg, rgba(117, 92, 207, 1), rgba(24, 1, 109, 1)); padding: 15px; text-align: center; font-size: 12px; color: rgba(255, 255, 255, 1)">
        <p style="margin: 0">Best regards,<br>QuizPlatform Team</p>
        <p style="margin: 5px 0 0"><a href="https://quizplatform.com" style="color: rgba(255, 255, 255, 1); text-decoration: underline">www.quizplatform.com</a></p>
    </div>
</div> 
`;

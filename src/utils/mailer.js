import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: parseInt(process.env.MAILTRAP_PORT),
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

export const sendResetEmail = async (to, token) => {
  const resetUrl = `https://community-service-app.vercel.app//reset-password?token=${token}`;
  await transporter.sendMail({
    from: '"Community Service App" <noreply@communityapp.ca>',
    to,
    subject: "Reset your password",
    html: `<p>Click below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
  });
};

// Email notification templates
export const sendIssueStatusUpdateEmail = async (userEmail, userName, issueTitle, status, updateText) => {
  const statusColors = {
    'Pending Approval': '#d1ecf1',
    'Under Review': '#fdf8d7',
    'Resolved': '#d4edda',
    'Rejected': '#f8d7da'
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #ff6b35; margin: 0;">Community Service App</h1>
        <p style="color: #666; margin: 10px 0 0 0;">Ontario Government</p>
      </div>
      
      <div style="padding: 30px; background-color: white;">
        <h2 style="color: #333; margin-bottom: 20px;">Issue Status Update</h2>
        
        <p>Dear ${userName},</p>
        
        <p>Your reported issue has been updated:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${issueTitle}</h3>
          <span style="background-color: ${statusColors[status]}; color: #333; padding: 5px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">
            ${status}
          </span>
        </div>
        
        ${updateText ? `
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>Update Details:</strong><br>
          ${updateText}
        </div>
        ` : ''}
        
        <p>You can view the full details of your issue by logging into your account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://community-service-app.vercel.app/login" 
             style="background-color: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
            View Issue Details
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Thank you for using the Community Service App.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© 2025 Community Service App – ReportEase. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"Community Service App" <noreply@communityapp.ca>',
    to: userEmail,
    subject: `Issue Update: ${issueTitle} - ${status}`,
    html
  });
};

export const sendIssueAssignmentEmail = async (userEmail, userName, issueTitle) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #ff6b35; margin: 0;">Community Service App</h1>
        <p style="color: #666; margin: 10px 0 0 0;">Ontario Government</p>
      </div>
      
      <div style="padding: 30px; background-color: white;">
        <h2 style="color: #333; margin-bottom: 20px;">New Issue Assignment</h2>
        
        <p>Dear ${userName},</p>
        
        <p>You have been assigned a new issue to handle:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${issueTitle}</h3>
          <span style="background-color: #d1ecf1; color: #333; padding: 5px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">
            Pending Review
          </span>
        </div>
        
        <p>Please review and take appropriate action on this issue as soon as possible.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://community-service-app.vercel.app/clerk/dashboard" 
             style="background-color: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
            View Issue Details
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Thank you for your service to the community.<br>
          If you have any questions, please contact your supervisor.
        </p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© 2025 Community Service App – ReportEase. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"Community Service App" <noreply@communityapp.ca>',
    to: userEmail,
    subject: `New Issue Assignment: ${issueTitle}`,
    html
  });
};

export const sendIssueEscalationEmail = async (userEmail, userName, issueTitle, priority, reason) => {
  const priorityColors = {
    'High': '#ffc107',
    'Critical': '#dc3545'
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #ff6b35; margin: 0;">Community Service App</h1>
        <p style="color: #666; margin: 10px 0 0 0;">Ontario Government</p>
      </div>
      
      <div style="padding: 30px; background-color: white;">
        <h2 style="color: #333; margin-bottom: 20px;">Issue Escalation Alert</h2>
        
        <p>Dear ${userName},</p>
        
        <p>An issue has been escalated and requires immediate attention:</p>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${issueTitle}</h3>
          <span style="background-color: ${priorityColors[priority]}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">
            ${priority} Priority
          </span>
        </div>
        
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>Escalation Reason:</strong><br>
          ${reason}
        </div>
        
        <p style="color: #dc3545; font-weight: bold;">This issue requires immediate attention due to its ${priority.toLowerCase()} priority level.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://community-service-app.vercel.app/admin/dashboard" 
             style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
            Review Issue Immediately
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Please take appropriate action as soon as possible.<br>
          If you have any questions, please contact the escalation team.
        </p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© 2025 Community Service App – ReportEase. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"Community Service App" <noreply@communityapp.ca>',
    to: userEmail,
    subject: `URGENT: Issue Escalation - ${issueTitle} (${priority} Priority)`,
    html
  });
};

export const sendIssueCreatedEmail = async (userEmail, userName, issueTitle, category, location) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #ff6b35; margin: 0;">Community Service App</h1>
        <p style="color: #666; margin: 10px 0 0 0;">Ontario Government</p>
      </div>
      
      <div style="padding: 30px; background-color: white;">
        <h2 style="color: #333; margin-bottom: 20px;">Issue Successfully Reported</h2>
        
        <p>Dear ${userName},</p>
        
        <p>Thank you for reporting an issue in your community. We have received your report and will begin processing it immediately.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${issueTitle}</h3>
          <p style="margin: 5px 0;"><strong>Category:</strong> ${category}</p>
          <p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>
          <span style="background-color: #d1ecf1; color: #333; padding: 5px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">
            Pending Approval
          </span>
        </div>
        
        <p>What happens next:</p>
        <ul style="color: #666;">
          <li>Your issue will be reviewed by our team</li>
          <li>It will be assigned to the appropriate department</li>
          <li>You'll receive updates on the progress</li>
          <li>We'll notify you when the issue is resolved</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://community-service-app.vercel.app/resident/dashboard" 
             style="background-color: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
            Track Your Issue
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Thank you for helping make Ontario a better place to live.<br>
          We appreciate your patience and cooperation.
        </p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© 2025 Community Service App – ReportEase. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"Community Service App" <noreply@communityapp.ca>',
    to: userEmail,
    subject: `Issue Reported Successfully: ${issueTitle}`,
    html
  });
};

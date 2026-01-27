import nodemailer from 'nodemailer'

// Create transporter with SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD, // Support both SMTP_PASS and SMTP_PASSWORD
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to,
      subject,
      html,
    })

    console.log('Email sent successfully:', info.messageId)
    return { success: true, data: info }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

export async function sendTaskAssignmentEmail({
  employeeEmail,
  employeeName,
  taskTitle,
  taskDescription,
  projectName,
  dueDate,
}: {
  employeeEmail: string
  employeeName: string
  taskTitle: string
  taskDescription?: string | null
  projectName: string
  dueDate?: Date | null
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h2 { color: #2563eb; }
          .task-details { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .task-details p { margin: 8px 0; }
          .label { font-weight: bold; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>New Task Assigned</h2>
          <p>Hi ${employeeName},</p>
          <p>You have been assigned a new task:</p>

          <div class="task-details">
            <h3>${taskTitle}</h3>
            <p><span class="label">Project:</span> ${projectName}</p>
            ${taskDescription ? `<p><span class="label">Description:</span> ${taskDescription}</p>` : ''}
            ${dueDate ? `<p><span class="label">Due Date:</span> ${new Date(dueDate).toLocaleDateString()}</p>` : ''}
          </div>

          <p>Please log in to view and manage your tasks.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: employeeEmail,
    subject: `New Task Assigned: ${taskTitle}`,
    html,
  })
}

export async function sendTaskCompletionEmail({
  adminEmail,
  employeeName,
  taskTitle,
  projectName,
  completedAt,
}: {
  adminEmail: string
  employeeName: string
  taskTitle: string
  projectName: string
  completedAt: Date
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h2 { color: #059669; }
          .task-details { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
          .task-details p { margin: 8px 0; }
          .label { font-weight: bold; color: #065f46; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Task Completed</h2>
          <p>The following task has been marked as completed:</p>

          <div class="task-details">
            <h3>${taskTitle}</h3>
            <p><span class="label">Project:</span> ${projectName}</p>
            <p><span class="label">Completed by:</span> ${employeeName}</p>
            <p><span class="label">Completed at:</span> ${completedAt.toLocaleString()}</p>
          </div>

          <p>Please log in to review and manage the task.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: adminEmail,
    subject: `Task Completed: ${taskTitle}`,
    html,
  })
}

// ============ TASK DEADLINE REMINDERS ============

export async function sendTaskDeadlineReminder({
  employeeEmail,
  employeeName,
  taskTitle,
  taskDescription,
  projectName,
  dueDate,
  daysUntilDue,
  taskId,
  isOverdue = false,
}: {
  employeeEmail: string
  employeeName: string
  taskTitle: string
  taskDescription?: string | null
  projectName: string
  dueDate: Date
  daysUntilDue: number
  taskId: string
  isOverdue?: boolean
}) {
  const urgencyColor = isOverdue ? '#dc2626' : daysUntilDue <= 1 ? '#ea580c' : '#f59e0b'
  const urgencyText = isOverdue
    ? `OVERDUE by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
    : daysUntilDue === 0
    ? 'DUE TODAY'
    : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h2 { color: ${urgencyColor}; }
          .urgent-banner { background: ${urgencyColor}; color: white; padding: 12px 20px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; font-size: 18px; }
          .task-details { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencyColor}; }
          .task-details p { margin: 8px 0; }
          .label { font-weight: bold; color: #6b7280; }
          .cta-button { display: inline-block; padding: 12px 24px; background: ${urgencyColor}; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${isOverdue ? '⚠️ Task Overdue' : '🔔 Task Deadline Reminder'}</h2>
          <p>Hi ${employeeName},</p>

          <div class="urgent-banner">${urgencyText}</div>

          <div class="task-details">
            <h3>${taskTitle}</h3>
            <p><span class="label">Project:</span> ${projectName}</p>
            ${taskDescription ? `<p><span class="label">Description:</span> ${taskDescription}</p>` : ''}
            <p><span class="label">Due Date:</span> ${new Date(dueDate).toLocaleDateString()} at ${new Date(dueDate).toLocaleTimeString()}</p>
          </div>

          <p>${isOverdue ? 'This task is past its deadline. Please update the status or provide an update on progress.' : 'Please ensure you complete this task on time.'}</p>

          <a href="${process.env.NEXTAUTH_URL}/employee/tasks" class="cta-button">View Task</a>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: employeeEmail,
    subject: isOverdue
      ? `⚠️ OVERDUE: ${taskTitle}`
      : `⏰ Reminder: ${taskTitle} ${urgencyText}`,
    html,
  })
}

// ============ APPROVAL WORKFLOW ============

export async function sendApprovalRequestEmail({
  approverEmail,
  approverName,
  taskTitle,
  taskDescription,
  projectName,
  employeeName,
  completedAt,
  taskId,
}: {
  approverEmail: string
  approverName: string
  taskTitle: string
  taskDescription?: string | null
  projectName: string
  employeeName: string
  completedAt: Date
  taskId: string
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h2 { color: #7c3aed; }
          .task-details { background: #faf5ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed; }
          .task-details p { margin: 8px 0; }
          .label { font-weight: bold; color: #6b21a8; }
          .cta-button { display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; margin-right: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>📋 Task Pending Approval</h2>
          <p>Hi ${approverName},</p>
          <p>A task is ready for your review and approval:</p>

          <div class="task-details">
            <h3>${taskTitle}</h3>
            <p><span class="label">Project:</span> ${projectName}</p>
            ${taskDescription ? `<p><span class="label">Description:</span> ${taskDescription}</p>` : ''}
            <p><span class="label">Completed by:</span> ${employeeName}</p>
            <p><span class="label">Completed at:</span> ${completedAt.toLocaleString()}</p>
          </div>

          <p>Please review the task and provide your approval or feedback.</p>

          <a href="${process.env.NEXTAUTH_URL}/admin/projects" class="cta-button">Review Task</a>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: approverEmail,
    subject: `📋 Approval Needed: ${taskTitle}`,
    html,
  })
}

export async function sendApprovalConfirmationEmail({
  employeeEmail,
  employeeName,
  taskTitle,
  projectName,
  approverName,
  approved,
  feedback,
}: {
  employeeEmail: string
  employeeName: string
  taskTitle: string
  projectName: string
  approverName: string
  approved: boolean
  feedback?: string | null
}) {
  const statusColor = approved ? '#059669' : '#dc2626'
  const statusText = approved ? '✅ APPROVED' : '❌ CHANGES REQUESTED'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h2 { color: ${statusColor}; }
          .status-banner { background: ${statusColor}; color: white; padding: 12px 20px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; font-size: 18px; }
          .task-details { background: ${approved ? '#f0fdf4' : '#fef2f2'}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor}; }
          .task-details p { margin: 8px 0; }
          .label { font-weight: bold; color: #6b7280; }
          .feedback { background: white; padding: 12px; border-radius: 6px; margin-top: 10px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${approved ? 'Task Approved!' : 'Task Needs Revision'}</h2>
          <p>Hi ${employeeName},</p>

          <div class="status-banner">${statusText}</div>

          <div class="task-details">
            <h3>${taskTitle}</h3>
            <p><span class="label">Project:</span> ${projectName}</p>
            <p><span class="label">Reviewed by:</span> ${approverName}</p>
            ${feedback ? `<div class="feedback"><span class="label">Feedback:</span><br/>${feedback}</div>` : ''}
          </div>

          <p>${approved
            ? 'Congratulations! Your task has been approved. Keep up the excellent work!'
            : 'Please review the feedback above and make the necessary changes. Resubmit the task when ready.'
          }</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: employeeEmail,
    subject: approved ? `✅ Approved: ${taskTitle}` : `📝 Changes Requested: ${taskTitle}`,
    html,
  })
}

// ============ CLIENT PORTAL ============

export async function sendClientWelcomeEmail({
  clientEmail,
  clientName,
  companyName,
  projectName,
  magicLink,
}: {
  clientEmail: string
  clientName: string
  companyName: string
  projectName?: string
  magicLink: string
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h2 { color: #2563eb; }
          .welcome-box { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
          .cta-button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .note { background: #fef3c7; padding: 12px; border-radius: 6px; margin-top: 20px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🎉 Welcome to the Client Portal!</h2>
          <p>Hi ${clientName},</p>
          <p>Welcome to <strong>${companyName}</strong>'s client portal! We're excited to have you on board.</p>

          <div class="welcome-box">
            ${projectName ? `<p><strong>Project:</strong> ${projectName}</p>` : ''}
            <p>Through the client portal, you can:</p>
            <ul>
              <li>Track project progress in real-time</li>
              <li>View tasks and milestones</li>
              <li>Access project documents and deliverables</li>
              <li>Communicate with the project team</li>
              <li>Review financial information</li>
            </ul>
          </div>

          <p>Click the button below to access your portal:</p>
          <a href="${magicLink}" class="cta-button">Access Portal</a>

          <div class="note">
            <strong>Note:</strong> This link is valid for 24 hours and can only be used once. For security, you'll need to request a new link for future logins.
          </div>

          <p>If you have any questions, please don't hesitate to reach out.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: clientEmail,
    subject: `Welcome to ${companyName} Client Portal`,
    html,
  })
}

export async function sendClientMagicLinkEmail({
  clientEmail,
  clientName,
  magicLink,
}: {
  clientEmail: string
  clientName: string
  magicLink: string
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h2 { color: #2563eb; }
          .link-box { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .cta-button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
          .note { background: #fef3c7; padding: 12px; border-radius: 6px; margin-top: 20px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🔐 Your Portal Access Link</h2>
          <p>Hi ${clientName},</p>
          <p>Here's your secure link to access the client portal:</p>

          <div class="link-box">
            <a href="${magicLink}" class="cta-button">Access Portal</a>
          </div>

          <div class="note">
            <strong>Security Note:</strong> This link is valid for 24 hours and can only be used once. If you didn't request this link, please ignore this email.
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: clientEmail,
    subject: 'Your Client Portal Access Link',
    html,
  })
}

// ============ RECURRING TRANSACTIONS ============

export async function sendRecurringTransactionConfirmation({
  recipientEmail,
  recipientName,
  transactionName,
  amount,
  frequency,
  nextRunDate,
  transactionType,
}: {
  recipientEmail: string
  recipientName: string
  transactionName: string
  amount: number
  frequency: string
  nextRunDate: Date
  transactionType: 'INCOME' | 'EXPENSE'
}) {
  const typeColor = transactionType === 'INCOME' ? '#059669' : '#dc2626'
  const typeIcon = transactionType === 'INCOME' ? '💰' : '💸'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h2 { color: ${typeColor}; }
          .transaction-details { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${typeColor}; }
          .transaction-details p { margin: 8px 0; }
          .label { font-weight: bold; color: #6b7280; }
          .amount { font-size: 24px; font-weight: bold; color: ${typeColor}; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${typeIcon} Recurring Transaction Processed</h2>
          <p>Hi ${recipientName},</p>
          <p>A recurring transaction has been processed successfully:</p>

          <div class="transaction-details">
            <h3>${transactionName}</h3>
            <p class="amount">$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><span class="label">Type:</span> ${transactionType === 'INCOME' ? 'Income' : 'Expense'}</p>
            <p><span class="label">Frequency:</span> ${frequency}</p>
            <p><span class="label">Next Scheduled:</span> ${nextRunDate.toLocaleDateString()}</p>
          </div>

          <p>This transaction has been automatically recorded in your account.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: recipientEmail,
    subject: `${typeIcon} Recurring ${transactionType === 'INCOME' ? 'Payment' : 'Transaction'} Processed: $${amount.toLocaleString()}`,
    html,
  })
}

export async function sendPayslipEmail({
  employeeEmail,
  employeeName,
  amount,
  period,
  payDate,
  companyName,
}: {
  employeeEmail: string
  employeeName: string
  amount: number
  period: string
  payDate: Date
  companyName: string
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h2 { color: #059669; }
          .payslip { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #059669; }
          .payslip h3 { color: #065f46; margin-top: 0; }
          .payslip p { margin: 8px 0; }
          .label { font-weight: bold; color: #065f46; }
          .amount { font-size: 32px; font-weight: bold; color: #059669; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>💵 Salary Payment Processed</h2>
          <p>Hi ${employeeName},</p>
          <p>Your salary for ${period} has been processed:</p>

          <div class="payslip">
            <h3>${companyName} - Payslip</h3>
            <p><span class="label">Employee:</span> ${employeeName}</p>
            <p><span class="label">Period:</span> ${period}</p>
            <p><span class="label">Payment Date:</span> ${payDate.toLocaleDateString()}</p>
            <div class="amount">$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">This is an automated notification. For detailed payslip information, please log in to the portal.</p>
          </div>

          <p>Thank you for your hard work!</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: employeeEmail,
    subject: `💵 Payslip - ${period}: $${amount.toLocaleString()}`,
    html,
  })
}

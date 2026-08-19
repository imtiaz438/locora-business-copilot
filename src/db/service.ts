import { db, schema } from './index.ts';
import { eq, desc, asc, or, isNull, inArray } from 'drizzle-orm';

// --- Business Profile ---
export async function getBusinessProfile() {
  try {
    const records = await db.select().from(schema.businessProfileTable).limit(1);
    return records[0] || null;
  } catch (err) {
    console.error('Error fetching business profile:', err);
    return null;
  }
}

export async function saveBusinessProfile(data: any) {
  try {
    const id = data.id || 'bp_main';
    const existing = await db.select().from(schema.businessProfileTable).where(eq(schema.businessProfileTable.id, id));
    if (existing.length > 0) {
      const updated = await db
        .update(schema.businessProfileTable)
        .set({
          ...data,
          logoConfig: data.logoConfig !== undefined ? data.logoConfig : existing[0].logoConfig,
          updatedAt: new Date(),
        })
        .where(eq(schema.businessProfileTable.id, id))
        .returning();
      return updated[0];
    } else {
      const inserted = await db
        .insert(schema.businessProfileTable)
        .values({
          id,
          name: data.name || 'My Business',
          tagline: data.tagline || '',
          industry: data.industry || '',
          description: data.description || '',
          targetAudience: data.targetAudience || '',
          toneOfVoice: data.toneOfVoice || '',
          website: data.website || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zip: data.zip || '',
          country: data.country || '',
          currency: data.currency || 'USD',
          taxRate: data.taxRate || 0,
          taxId: data.taxId || '',
          logoUrl: data.logoUrl || '',
          logoConfig: data.logoConfig || null,
          updatedAt: new Date(),
        })
        .returning();
      return inserted[0];
    }
  } catch (err) {
    console.error('Error saving business profile:', err);
    return data;
  }
}

// --- App Settings ---
export async function getSettings() {
  try {
    const records = await db.select().from(schema.settingsTable).limit(1);
    return records[0] || null;
  } catch (err) {
    console.error('Error fetching settings:', err);
    return null;
  }
}

export async function saveSettings(data: any) {
  try {
    const id = data.id || 'settings_main';
    const existing = await db.select().from(schema.settingsTable).where(eq(schema.settingsTable.id, id));
    if (existing.length > 0) {
      const updated = await db
        .update(schema.settingsTable)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(schema.settingsTable.id, id))
        .returning();
      return updated[0];
    } else {
      const inserted = await db
        .insert(schema.settingsTable)
        .values({
          id,
          activeProvider: data.activeProvider || 'gemini',
          providerKeys: data.providerKeys || {},
          theme: data.theme || 'dark',
          autoSave: data.autoSave !== undefined ? data.autoSave : true,
          defaultCurrency: data.defaultCurrency || 'USD',
          defaultTaxRate: data.defaultTaxRate || 0,
          updatedAt: new Date(),
        })
        .returning();
      return inserted[0];
    }
  } catch (err) {
    console.error('Error saving settings:', err);
    return data;
  }
}

// Helper to normalized user email condition
function getUserEmailCondition(tableEmailCol: any, userEmail?: string) {
  if (!userEmail) return undefined;
  const clean = userEmail.toLowerCase().trim();
  return eq(tableEmailCol, clean);
}

// --- Customers ---
export async function getCustomers(userEmail?: string) {
  try {
    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';
    if (cleanEmail) {
      return await db
        .select()
        .from(schema.customersTable)
        .where(eq(schema.customersTable.userEmail, cleanEmail))
        .orderBy(desc(schema.customersTable.createdAt));
    }
    return [];
  } catch (err) {
    console.error('Error fetching customers:', err);
    return [];
  }
}

export async function createCustomer(data: any, userEmail?: string) {
  try {
    const id = data.id || `cust_${Date.now()}`;
    const cleanEmail = (userEmail || data.userEmail || '').toLowerCase().trim();
    const result = await db
      .insert(schema.customersTable)
      .values({
        id,
        userEmail: cleanEmail,
        name: data.name,
        company: data.company || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        status: data.status || 'lead',
        value: Number(data.value || 0),
        tags: Array.isArray(data.tags) ? data.tags : [],
        notes: data.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await logActivity('customer', `New Client Added: ${data.name}`, `Added customer record for ${data.company || data.name}`, { customerId: id }, undefined, cleanEmail);
    return result[0];
  } catch (err) {
    console.error('Error creating customer:', err);
    return data;
  }
}

export async function updateCustomer(id: string, data: any, userEmail?: string) {
  try {
    const { createdAt, ...cleanData } = data;
    const cleanEmail = (userEmail || data.userEmail || '').toLowerCase().trim();
    const updatePayload: any = { updatedAt: new Date() };
    if (cleanEmail) updatePayload.userEmail = cleanEmail;
    if (cleanData.name !== undefined) updatePayload.name = cleanData.name;
    if (cleanData.company !== undefined) updatePayload.company = cleanData.company;
    if (cleanData.email !== undefined) updatePayload.email = cleanData.email;
    if (cleanData.phone !== undefined) updatePayload.phone = cleanData.phone;
    if (cleanData.address !== undefined) updatePayload.address = cleanData.address;
    if (cleanData.status !== undefined) updatePayload.status = cleanData.status;
    if (cleanData.value !== undefined) updatePayload.value = Number(cleanData.value || 0);
    if (cleanData.tags !== undefined) updatePayload.tags = Array.isArray(cleanData.tags) ? cleanData.tags : [];
    if (cleanData.notes !== undefined) updatePayload.notes = cleanData.notes;

    const result = await db
      .update(schema.customersTable)
      .set(updatePayload)
      .where(eq(schema.customersTable.id, id))
      .returning();

    await logActivity('customer', `Client Record Updated: ${data.name || id}`, `Updated contact and pipeline details`, { customerId: id }, undefined, cleanEmail);
    return result[0];
  } catch (err) {
    console.error('Error updating customer:', err);
    return data;
  }
}

export async function deleteCustomer(id: string) {
  try {
    await db.delete(schema.customersTable).where(eq(schema.customersTable.id, id));
    await logActivity('customer', `Client Deleted`, `Removed customer record (${id})`, { customerId: id });
    return true;
  } catch (err) {
    console.error('Error deleting customer:', err);
    return false;
  }
}

// --- Projects ---
export async function getProjects(userEmail?: string) {
  try {
    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';
    if (cleanEmail) {
      return await db
        .select()
        .from(schema.projectsTable)
        .where(eq(schema.projectsTable.userEmail, cleanEmail))
        .orderBy(desc(schema.projectsTable.createdAt));
    }
    return [];
  } catch (err) {
    console.error('Error fetching projects:', err);
    return [];
  }
}

export async function createProject(data: any, userEmail?: string) {
  try {
    const id = data.id || `proj_${Date.now()}`;
    const cleanEmail = (userEmail || data.userEmail || '').toLowerCase().trim();
    const result = await db
      .insert(schema.projectsTable)
      .values({
        id,
        userEmail: cleanEmail,
        title: data.title,
        customerId: data.customerId || null,
        customerName: data.customerName || '',
        status: data.status || 'planning',
        budget: Number(data.budget || 0),
        startDate: data.startDate || '',
        targetDate: data.targetDate || '',
        description: data.description || '',
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
        createdAt: new Date(),
      })
      .returning();

    await logActivity('project', `New Project Created: ${data.title}`, `Project created for ${data.customerName || 'Workspace'}`, { projectId: id }, undefined, cleanEmail);
    return result[0];
  } catch (err) {
    console.error('Error creating project:', err);
    return data;
  }
}

export async function updateProject(id: string, data: any, userEmail?: string) {
  try {
    const { createdAt, ...cleanData } = data;
    const cleanEmail = (userEmail || data.userEmail || '').toLowerCase().trim();
    const updatePayload: any = {};
    if (cleanEmail) updatePayload.userEmail = cleanEmail;
    if (cleanData.title !== undefined) updatePayload.title = cleanData.title;
    if (cleanData.customerId !== undefined) updatePayload.customerId = cleanData.customerId;
    if (cleanData.customerName !== undefined) updatePayload.customerName = cleanData.customerName;
    if (cleanData.status !== undefined) updatePayload.status = cleanData.status;
    if (cleanData.budget !== undefined) updatePayload.budget = Number(cleanData.budget || 0);
    if (cleanData.startDate !== undefined) updatePayload.startDate = cleanData.startDate;
    if (cleanData.targetDate !== undefined) updatePayload.targetDate = cleanData.targetDate;
    if (cleanData.description !== undefined) updatePayload.description = cleanData.description;
    if (cleanData.tasks !== undefined) updatePayload.tasks = Array.isArray(cleanData.tasks) ? cleanData.tasks : [];

    const result = await db
      .update(schema.projectsTable)
      .set(updatePayload)
      .where(eq(schema.projectsTable.id, id))
      .returning();

    await logActivity('project', `Project Updated: ${data.title || id}`, `Updated project milestone/status`, { projectId: id }, undefined, cleanEmail);
    return result[0];
  } catch (err) {
    console.error('Error updating project:', err);
    return data;
  }
}

export async function deleteProject(id: string) {
  try {
    await db.delete(schema.projectsTable).where(eq(schema.projectsTable.id, id));
    await logActivity('project', `Project Removed`, `Deleted project (${id})`, { projectId: id });
    return true;
  } catch (err) {
    console.error('Error deleting project:', err);
    return false;
  }
}

// --- Invoices ---
export async function getInvoices(userEmail?: string) {
  try {
    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';
    if (cleanEmail) {
      return await db
        .select()
        .from(schema.invoicesTable)
        .where(eq(schema.invoicesTable.userEmail, cleanEmail))
        .orderBy(desc(schema.invoicesTable.createdAt));
    }
    return [];
  } catch (err) {
    console.error('Error fetching invoices:', err);
    return [];
  }
}

export async function createInvoice(data: any, userEmail?: string) {
  try {
    const id = data.id || `inv_${Date.now()}`;
    const cleanEmail = (userEmail || data.userEmail || '').toLowerCase().trim();
    const result = await db
      .insert(schema.invoicesTable)
      .values({
        id,
        userEmail: cleanEmail,
        invoiceNumber: data.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
        customerId: data.customerId || null,
        customerName: data.customerName || 'Client',
        customerEmail: data.customerEmail || '',
        customerAddress: data.customerAddress || '',
        issueDate: data.issueDate || new Date().toISOString().split('T')[0],
        dueDate: data.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: data.status || 'draft',
        subtotal: Number(data.subtotal || 0),
        taxRate: Number(data.taxRate || 0),
        taxAmount: Number(data.taxAmount || 0),
        discountAmount: Number(data.discountAmount || 0),
        total: Number(data.total || 0),
        notes: data.notes || '',
        paymentTerms: data.paymentTerms || 'Net 15',
        createdAt: new Date(),
      })
      .returning();

    await logActivity('invoice', `Invoice Generated: ${result[0].invoiceNumber}`, `Amount: $${data.total} for ${data.customerName}`, { invoiceId: id }, undefined, cleanEmail);
    return result[0];
  } catch (err) {
    console.error('Error creating invoice:', err);
    return data;
  }
}

export async function updateInvoiceStatus(id: string, status: string, userEmail?: string) {
  try {
    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';
    const result = await db
      .update(schema.invoicesTable)
      .set({ status })
      .where(eq(schema.invoicesTable.id, id))
      .returning();

    await logActivity('invoice', `Invoice Status Changed: ${status.toUpperCase()}`, `Invoice ${result[0]?.invoiceNumber || id} updated to ${status}`, { invoiceId: id, status }, undefined, cleanEmail);
    return result[0];
  } catch (err) {
    console.error('Error updating invoice status:', err);
    return { id, status };
  }
}

export async function deleteInvoice(id: string) {
  try {
    await db.delete(schema.invoicesTable).where(eq(schema.invoicesTable.id, id));
    return true;
  } catch (err) {
    console.error('Error deleting invoice:', err);
    return false;
  }
}

// --- Proposals ---
export async function getProposals(userEmail?: string) {
  try {
    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';
    if (cleanEmail) {
      return await db
        .select()
        .from(schema.proposalsTable)
        .where(eq(schema.proposalsTable.userEmail, cleanEmail))
        .orderBy(desc(schema.proposalsTable.createdAt));
    }
    return [];
  } catch (err) {
    console.error('Error fetching proposals:', err);
    return [];
  }
}

export async function createProposal(data: any, userEmail?: string) {
  try {
    const id = data.id || `prop_${Date.now()}`;
    const cleanEmail = (userEmail || data.userEmail || '').toLowerCase().trim();
    const result = await db
      .insert(schema.proposalsTable)
      .values({
        id,
        userEmail: cleanEmail,
        title: data.title,
        type: data.type || 'proposal',
        customerId: data.customerId || null,
        customerName: data.customerName || 'Prospect',
        status: data.status || 'draft',
        summary: data.summary || '',
        scopeOfWork: data.scopeOfWork || '',
        deliverables: Array.isArray(data.deliverables) ? data.deliverables : [],
        timeline: data.timeline || '',
        pricingBreakdown: Array.isArray(data.pricingBreakdown) ? data.pricingBreakdown : [],
        totalAmount: Number(data.totalAmount || 0),
        termsAndConditions: data.termsAndConditions || '',
        generatedContent: data.generatedContent || '',
        createdAt: new Date(),
      })
      .returning();

    await logActivity('proposal', `AI Proposal Drafted: ${data.title}`, `Created proposal for ${data.customerName}`, { proposalId: id }, undefined, cleanEmail);
    return result[0];
  } catch (err) {
    console.error('Error creating proposal:', err);
    return data;
  }
}

export async function updateProposalStatus(id: string, status: string, userEmail?: string) {
  try {
    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';
    const result = await db
      .update(schema.proposalsTable)
      .set({ status })
      .where(eq(schema.proposalsTable.id, id))
      .returning();

    await logActivity('proposal', `Proposal ${status.toUpperCase()}`, `Proposal status changed to ${status}`, { proposalId: id, status }, undefined, cleanEmail);
    return result[0];
  } catch (err) {
    console.error('Error updating proposal status:', err);
    return { id, status };
  }
}

export async function deleteProposal(id: string) {
  try {
    await db.delete(schema.proposalsTable).where(eq(schema.proposalsTable.id, id));
    return true;
  } catch (err) {
    console.error('Error deleting proposal:', err);
    return false;
  }
}

// --- Documents ---
export async function getDocuments(userEmail?: string) {
  try {
    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';
    if (cleanEmail) {
      return await db
        .select()
        .from(schema.documentsTable)
        .where(eq(schema.documentsTable.userEmail, cleanEmail))
        .orderBy(desc(schema.documentsTable.createdAt));
    }
    return [];
  } catch (err) {
    console.error('Error fetching documents:', err);
    return [];
  }
}

export async function createDocument(data: any, userEmail?: string) {
  try {
    const id = data.id || `doc_${Date.now()}`;
    const cleanEmail = (userEmail || data.userEmail || '').toLowerCase().trim();
    const result = await db
      .insert(schema.documentsTable)
      .values({
        id,
        userEmail: cleanEmail,
        title: data.title,
        type: data.type || 'content',
        content: data.content || '',
        prompt: data.prompt || '',
        targetAudience: data.targetAudience || '',
        tone: data.tone || '',
        createdAt: new Date(),
      })
      .returning();

    await logActivity('document', `AI Document Created: ${data.title}`, `Generated document type: ${data.type}`, { documentId: id }, undefined, cleanEmail);
    return result[0];
  } catch (err) {
    console.error('Error creating document:', err);
    return data;
  }
}

export async function deleteDocument(id: string) {
  try {
    await db.delete(schema.documentsTable).where(eq(schema.documentsTable.id, id));
    return true;
  } catch (err) {
    console.error('Error deleting document:', err);
    return false;
  }
}

// --- AI Conversations ---
export async function getAiConversations(userEmail?: string) {
  try {
    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';
    let convs: any[] = [];
    if (cleanEmail) {
      convs = await db
        .select()
        .from(schema.aiConversationsTable)
        .where(eq(schema.aiConversationsTable.userEmail, cleanEmail))
        .orderBy(desc(schema.aiConversationsTable.updatedAt));
    } else {
      return [];
    }

    if (!convs || convs.length === 0) return [];

    const convIds = convs.map((c) => c.id);
    const messages = await db
      .select()
      .from(schema.aiMessagesTable)
      .where(inArray(schema.aiMessagesTable.conversationId, convIds))
      .orderBy(asc(schema.aiMessagesTable.timestamp));

    const msgMap = new Map<string, any[]>();
    (messages || []).forEach((m) => {
      if (!m.conversationId) return;
      if (!msgMap.has(m.conversationId)) msgMap.set(m.conversationId, []);
      msgMap.get(m.conversationId)!.push({
        id: m.id,
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
        contextAttached: m.contextAttached || undefined,
      });
    });

    return convs.map((c) => ({
      ...c,
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
      messages: msgMap.get(c.id) || [],
    }));
  } catch (err) {
    console.error('Error fetching AI conversations:', err);
    return [];
  }
}

export async function createAiConversation(title: string = 'New AI Business Chat', userEmail?: string) {
  try {
    const id = `conv_${Date.now()}`;
    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';
    const result = await db
      .insert(schema.aiConversationsTable)
      .values({
        id,
        userEmail: cleanEmail,
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await logActivity('chat', `AI Session Started`, `Topic: ${title}`, { conversationId: id }, undefined, cleanEmail);
    return { ...result[0], messages: [] };
  } catch (err) {
    console.error('Error creating AI conversation:', err);
    return { id: `conv_${Date.now()}`, title, messages: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
}

export async function syncAiConversation(conv: any, userEmail?: string) {
  try {
    if (!conv || !conv.id) return null;
    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';

    await db
      .insert(schema.aiConversationsTable)
      .values({
        id: conv.id,
        userEmail: cleanEmail,
        title: conv.title || 'New AI Business Chat',
        createdAt: conv.createdAt ? new Date(conv.createdAt) : new Date(),
        updatedAt: conv.updatedAt ? new Date(conv.updatedAt) : new Date(),
      })
      .onConflictDoUpdate({
        target: schema.aiConversationsTable.id,
        set: {
          title: conv.title || 'New AI Business Chat',
          updatedAt: new Date(),
        },
      });

    if (Array.isArray(conv.messages) && conv.messages.length > 0) {
      for (const m of conv.messages) {
        if (!m.id || !m.text) continue;
        await db
          .insert(schema.aiMessagesTable)
          .values({
            id: m.id,
            conversationId: conv.id,
            sender: m.sender || 'user',
            text: m.text,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            contextAttached: m.contextAttached || null,
          })
          .onConflictDoNothing();
      }
    }
    return true;
  } catch (err) {
    console.error('Error syncing AI conversation:', err);
    return false;
  }
}

export async function deleteAiConversation(id: string) {
  try {
    await db.delete(schema.aiConversationsTable).where(eq(schema.aiConversationsTable.id, id));
    return true;
  } catch (err) {
    console.error('Error deleting AI conversation:', err);
    return false;
  }
}

// --- Activity Logs ---
export async function getActivityLogs(limit: number = 20, userEmail?: string) {
  try {
    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';
    if (cleanEmail) {
      return await db
        .select()
        .from(schema.activityLogsTable)
        .where(eq(schema.activityLogsTable.userEmail, cleanEmail))
        .orderBy(desc(schema.activityLogsTable.createdAt))
        .limit(limit);
    }
    return [];
  } catch (err) {
    console.error('Error fetching activity logs:', err);
    return [];
  }
}

export async function logActivity(type: string, title: string, description?: string, metadata?: any, userId?: string, userEmail?: string) {
  try {
    const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';
    await db.insert(schema.activityLogsTable).values({
      id,
      userId: userId || 'usr_current',
      userEmail: cleanEmail,
      type,
      title,
      description: description || '',
      metadata: metadata || {},
      createdAt: new Date(),
    });
  } catch (err) {
    console.error('Error recording activity log:', err);
  }
}

// --- Users ---
export async function getUsers() {
  try {
    return await db.select().from(schema.users);
  } catch (err) {
    console.error('Error fetching users from Cloud SQL:', err);
    return [];
  }
}

export async function deleteUser(email: string, uid?: string) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    if (uid) {
      await db.delete(schema.users).where(eq(schema.users.uid, uid));
    }
    await db.delete(schema.users).where(eq(schema.users.email, cleanEmail));
    return true;
  } catch (err) {
    console.error('Error deleting user from Cloud SQL:', err);
    return false;
  }
}

// --- Payment Transactions ---
export async function getTransactions() {
  try {
    return await db.select().from(schema.transactionsTable).orderBy(desc(schema.transactionsTable.createdAt));
  } catch (err) {
    console.error('Error fetching transactions from Cloud SQL:', err);
    return [];
  }
}

export async function saveTransaction(txn: any) {
  try {
    const existing = await db.select().from(schema.transactionsTable).where(eq(schema.transactionsTable.id, txn.id));
    if (existing.length > 0) {
      const updated = await db
        .update(schema.transactionsTable)
        .set({
          ...txn,
          updatedAt: new Date(),
        })
        .where(eq(schema.transactionsTable.id, txn.id))
        .returning();
      return updated[0];
    } else {
      const inserted = await db
        .insert(schema.transactionsTable)
        .values({
          id: txn.id,
          userId: txn.userId || '',
          userEmail: (txn.userEmail || '').toLowerCase().trim(),
          userName: txn.userName || '',
          planTier: txn.planTier || 'pro',
          billingCycle: txn.billingCycle || 'monthly',
          amount: txn.amount || 0,
          currency: txn.currency || 'USD',
          paymentMethod: txn.paymentMethod || 'paddle',
          paddleDetails: txn.paddleDetails || null,
          lemonSqueezyDetails: txn.lemonSqueezyDetails || null,
          cardDetails: txn.cardDetails || null,
          status: txn.status || 'success',
          failureReason: txn.failureReason || null,
          refundedAmount: txn.refundedAmount || null,
          refundReason: txn.refundReason || null,
          refundedAt: txn.refundedAt || null,
          invoiceId: txn.invoiceId || null,
          isTestMode: !!txn.isTestMode,
          createdAt: txn.createdAt ? new Date(txn.createdAt) : new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return inserted[0];
    }
  } catch (err) {
    console.error('Error saving transaction to Cloud SQL:', err);
    return null;
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    await db.delete(schema.transactionsTable).where(eq(schema.transactionsTable.id, transactionId));
    return true;
  } catch (err) {
    console.error('Error deleting transaction from Cloud SQL:', err);
    return false;
  }
}

export async function getNewsletterSubscribers() {
  try {
    return await db.select().from(schema.newsletterSubscribersTable);
  } catch (err) {
    console.error('Error fetching newsletter subscribers from Cloud SQL:', err);
    return [];
  }
}

export async function addNewsletterSubscriber(email: string, name?: string) {
  try {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const result = await db
      .insert(schema.newsletterSubscribersTable)
      .values({
        id,
        email: email.toLowerCase().trim(),
        name: name || '',
        subscribedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.newsletterSubscribersTable.email,
        set: {
          status: 'active',
        },
      })
      .returning();

    return result[0];
  } catch (err) {
    console.error('Error adding newsletter subscriber to Cloud SQL:', err);
    return null;
  }
}

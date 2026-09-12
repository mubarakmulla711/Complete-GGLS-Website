/**
 * tree.js — High Quality Binary MLM Tree Renderer
 * Clean tree layout with SVG connecting lines, zoom controls, and click-to-add slots.
 */

const TREE = {
  colors: {
    P1: { bg: 'linear-gradient(135deg, #7c3aed, #9333ea)', text: '#fff', border: '#6d28d9' },
    P2: { bg: 'linear-gradient(135deg, #2563eb, #3b82f6)', text: '#fff', border: '#1d4ed8' },
    empty: { bg: '#f8fafc', text: '#64748b', border: '#cbd5e1' }
  },

  /**
   * Render complete interactive binary tree.
   * @param {string} rootId
   * @param {HTMLElement} container
   * @param {number} maxDepth
   */
  render(rootId, container, maxDepth = 4) {
    if (!container) return;
    container.innerHTML = '';

    const rootMember = APP.getMemberById(rootId);
    if (!rootMember) {
      container.innerHTML = '<div class="no-data"><i class="fas fa-exclamation-circle"></i> Member not found</div>';
      return;
    }

    const treeWrapper = document.createElement('div');
    treeWrapper.className = 'binary-tree-canvas';
    treeWrapper.id = 'binaryTreeCanvas';

    treeWrapper.appendChild(this._buildBranch(rootMember.id, 1, maxDepth, null, null));
    container.appendChild(treeWrapper);
  },

  /**
   * Recursively build binary branch node.
   */
  _buildBranch(memberId, currentDepth, maxDepth, parentId, position) {
    const branch = document.createElement('div');
    branch.className = 'tree-branch';

    const nodeEl = this._createNodeCard(memberId, parentId, position);
    branch.appendChild(nodeEl);

    if (currentDepth < maxDepth) {
      const m = memberId ? APP.getMemberById(memberId) : null;
      const leftId = m ? m.leftMemberId : null;
      const rightId = m ? m.rightMemberId : null;

      // Only show child row if this node exists, or if we want to show empty slots
      if (memberId) {
        const childrenRow = document.createElement('div');
        childrenRow.className = 'tree-children-row';

        const leftBranch = this._buildBranch(leftId, currentDepth + 1, maxDepth, m.id, 'left');
        const rightBranch = this._buildBranch(rightId, currentDepth + 1, maxDepth, m.id, 'right');

        childrenRow.appendChild(leftBranch);
        childrenRow.appendChild(rightBranch);
        branch.appendChild(childrenRow);
      }
    }

    return branch;
  },

  /**
   * Create individual node DOM element.
   */
  _createNodeCard(memberId, parentId, position) {
    const card = document.createElement('div');

    if (!memberId) {
      card.className = 'tree-node-card empty-node';
      card.innerHTML = `
        <div class="empty-icon"><i class="fas fa-plus-circle"></i></div>
        <div class="empty-label">Add Member</div>
        <div class="empty-pos">${position ? position.toUpperCase() : 'OPEN'}</div>
      `;
      if (parentId && position) {
        card.onclick = () => {
          window.location.href = `register.html?sponsor=${parentId}&pos=${position}`;
        };
      }
      return card;
    }

    const m = APP.getMemberById(memberId);
    if (!m) return card;

    const isP1 = m.packageId === 'P1';
    const pkgCls = isP1 ? 'pkg-p1' : (m.packageId === 'P2' ? 'pkg-p2' : 'pkg-default');

    card.className = `tree-node-card ${pkgCls}`;
    card.setAttribute('data-id', m.id);

    const initials = m.name ? m.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'GG';

    card.innerHTML = `
      <div class="node-header">
        <span class="node-avatar">${initials}</span>
        <span class="node-id">${m.id}</span>
      </div>
      <div class="node-name" title="${m.name}">${m.name}</div>
      <div class="node-rank">${m.rank || 'Member'}</div>
      <div class="node-stats-grid">
        <div class="stat-col"><span class="lbl">L:</span> ${APP.fmt(m.leftBV || 0)}</div>
        <div class="stat-col"><span class="lbl">R:</span> ${APP.fmt(m.rightBV || 0)}</div>
      </div>
    `;

    card.onclick = () => this.showNodeDetail(m.id);
    return card;
  },

  showNodeDetail(memberId) {
    const m = APP.getMemberById(memberId);
    if (!m) return;
    const modal = document.getElementById('treeModal');
    if (!modal) return;

    document.getElementById('modal-id').textContent   = m.id;
    document.getElementById('modal-name').textContent = m.name;
    document.getElementById('modal-rank').textContent = m.rank || 'Member';
    document.getElementById('modal-lbv').textContent  = (m.leftBV || 0).toLocaleString('en-IN');
    document.getElementById('modal-rbv').textContent  = (m.rightBV || 0).toLocaleString('en-IN');
    document.getElementById('modal-lrp').textContent  = Number(m.leftRP || 0).toFixed(2);
    document.getElementById('modal-rrp').textContent  = Number(m.rightRP || 0).toFixed(2);
    document.getElementById('modal-pkg').textContent  = m.packageId === 'P1'
      ? '₹10,000 Premium Package'
      : (m.packageId === 'P2' ? '₹5,000 Standard Package' : 'Standard');
    
    const sponsor = m.sponsorId ? APP.getMemberById(m.sponsorId) : null;
    const sponsorEl = document.getElementById('modal-sponsor');
    if(sponsorEl) sponsorEl.textContent = sponsor ? `${sponsor.name} (${sponsor.id})` : (m.sponsorId || 'None');

    modal.classList.add('active');
  }
};

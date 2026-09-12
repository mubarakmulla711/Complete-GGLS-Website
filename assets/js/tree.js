/**
 * tree.js — High Quality Binary MLM Tree Renderer
 * Clean tree layout with SVG connecting lines, 3-row display, and multi-page pagination.
 */

const TREE = {
  colors: {
    P1: { bg: 'linear-gradient(135deg, #7c3aed, #9333ea)', text: '#fff', border: '#6d28d9' },
    P2: { bg: 'linear-gradient(135deg, #2563eb, #3b82f6)', text: '#fff', border: '#1d4ed8' },
    empty: { bg: '#f8fafc', text: '#64748b', border: '#cbd5e1' }
  },

  /**
   * Render binary tree with strict 3 rows (depth = 3).
   * Row 1: Root node (1 node)
   * Row 2: Left & Right child (2 nodes)
   * Row 3: Grandchildren (4 nodes)
   * Nodes at Row 3 with further children offer a "Next Page / Expand" button.
   * @param {string} rootId
   * @param {HTMLElement} container
   * @param {number} maxDepth
   */
  render(rootId, container, maxDepth = 3) {
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
   * Ensures left child ONLY appears on the left, and right child ONLY appears on the right.
   */
  _buildBranch(memberId, currentDepth, maxDepth, parentId, position) {
    const branch = document.createElement('div');
    branch.className = `tree-branch pos-${position || 'root'}`;

    const m = memberId ? APP.getMemberById(memberId) : null;
    const isBottomRow = currentDepth === maxDepth;
    const hasChildren = m && (m.leftMemberId || m.rightMemberId || (APP.getMembers && APP.getMembers().some(item => item.parentId === m.id)));

    const nodeEl = this._createNodeCard(memberId, parentId, position, isBottomRow && hasChildren);
    branch.appendChild(nodeEl);

    // If within the 3 rows, render left and right children
    if (currentDepth < maxDepth) {
      if (memberId && m) {
        // Retrieve explicit left and right children
        // Also safeguard in case child's position is recorded on child object
        let leftId = m.leftMemberId;
        let rightId = m.rightMemberId;

        // Double check members who have m.id as sponsor/parent and specified position
        const allMembers = APP.getMembers();
        if (!leftId) {
          const foundLeft = allMembers.find(item => item.parentId === m.id && item.position === 'left');
          if (foundLeft) leftId = foundLeft.id;
        }
        if (!rightId) {
          const foundRight = allMembers.find(item => item.parentId === m.id && item.position === 'right');
          if (foundRight) rightId = foundRight.id;
        }

        const childrenRow = document.createElement('div');
        childrenRow.className = 'tree-children-row';

        // LEFT branch strictly contains leftId
        const leftBranch = this._buildBranch(leftId, currentDepth + 1, maxDepth, m.id, 'left');
        // RIGHT branch strictly contains rightId
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
  _createNodeCard(memberId, parentId, position, hasNextPage = false) {
    const card = document.createElement('div');

    if (!memberId) {
      card.className = `tree-node-card empty-node slot-${position || 'open'}`;
      card.innerHTML = `
        <div class="empty-icon"><i class="fas fa-user-plus"></i></div>
        <div class="empty-label">+ Add Member</div>
        <div class="empty-pos">${position ? position.toUpperCase() + ' SIDE' : 'OPEN'}</div>
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

    card.className = `tree-node-card ${pkgCls} slot-${position || 'root'}`;
    card.setAttribute('data-id', m.id);

    const initials = m.name ? m.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'GG';
    const posBadge = position ? `<span class="pos-badge">${position.toUpperCase()}</span>` : '';

    // "Next 3 Rows" button if this node is at row 3 and has further team downline
    const nextBtnHtml = hasNextPage ? `
      <div class="next-page-pill" onclick="event.stopPropagation(); if(window.navigateToTreeNode) window.navigateToTreeNode('${m.id}')" title="Show next 3 rows starting from this person">
        <i class="fas fa-level-down-alt"></i> Next 3 Rows <i class="fas fa-chevron-right"></i>
      </div>
    ` : '';

    card.innerHTML = `
      <div class="node-header">
        <span class="node-avatar">${initials}</span>
        <span class="node-id">${m.id}</span>
        ${posBadge}
      </div>
      <div class="node-name" title="${m.name}">${m.name}</div>
      <div class="node-rank">${m.rank || 'Member'}</div>
      <div class="node-stats-grid">
        <div class="stat-col"><span class="lbl">L:</span> ${APP.fmt(m.leftBV || 0)}</div>
        <div class="stat-col"><span class="lbl">R:</span> ${APP.fmt(m.rightBV || 0)}</div>
      </div>
      ${nextBtnHtml}
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

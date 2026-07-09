#include "BTree.h"

BTree::BTree(int degreeValue) {
    root = new BTreeNode(true);
    degree = degreeValue;
}

// Splits a full child node
void BTree::splitChild(BTreeNode* parent, int index) {
    BTreeNode* fullChild = parent->children[index];
    BTreeNode* newChild = new BTreeNode(fullChild->leaf);

    BTreeEntry middleEntry = fullChild->keys[degree - 1];

    for (int j = 0; j < degree - 1; j++) {
        newChild->keys.push_back(fullChild->keys[j + degree]);
    }

    if (!fullChild->leaf) {
        for (int j = 0; j < degree; j++) {
            newChild->children.push_back(fullChild->children[j + degree]);
        }
    }

    fullChild->keys.resize(degree - 1);

    if (!fullChild->leaf) {
        fullChild->children.resize(degree);
    }

    parent->children.insert(parent->children.begin() + index + 1, newChild);
    parent->keys.insert(parent->keys.begin() + index, middleEntry);
}

// Inserts into a node that is not full
void BTree::insertNonFull(BTreeNode* node, BTreeEntry entry) {
    int i = node->keys.size() - 1;

    if (node->leaf) {
        node->keys.push_back(entry);

        while (i >= 0 && entry.key < node->keys[i].key) {
            node->keys[i + 1] = node->keys[i];
            i--;
        }

        node->keys[i + 1] = entry;
    } else {
        while (i >= 0 && entry.key < node->keys[i].key) {
            i--;
        }

        i++;

        if (node->children[i]->keys.size() == 2 * degree - 1) {
            splitChild(node, i);

            if (entry.key > node->keys[i].key) {
                i++;
            }
        }

        insertNonFull(node->children[i], entry);
    }
}

// Inserts a new song into the B Tree
void BTree::insert(double key, Song* song) {
    BTreeEntry entry;
    entry.key = key;
    entry.song = song;

    if (root->keys.size() == 2 * degree - 1) {
        BTreeNode* newRoot = new BTreeNode(false);
        newRoot->children.push_back(root);
        splitChild(newRoot, 0);
        root = newRoot;
    }

    insertNonFull(root, entry);
}

// Finds all songs within a range
void BTree::rangeSearch(BTreeNode* node, double minValue, double maxValue, vector<Song*>& results) {
    if (node == nullptr) {
        return;
    }

    int i = 0;

    while (i < node->keys.size()) {
        if (!node->leaf) {
            rangeSearch(node->children[i], minValue, maxValue, results);
        }

        if (node->keys[i].key >= minValue && node->keys[i].key <= maxValue) {
            results.push_back(node->keys[i].song);
        }

        i++;
    }

    if (!node->leaf) {
        rangeSearch(node->children[i], minValue, maxValue, results);
    }
}

vector<Song*> BTree::searchRange(double minValue, double maxValue) {
    vector<Song*> results;
    rangeSearch(root, minValue, maxValue, results);
    return results;
}
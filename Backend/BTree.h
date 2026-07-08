#ifndef BTREE_H
#define BTREE_H

#include <vector>
#include "Song.h"
using namespace std;

// Stores a searchable numeric value and its song
struct BTreeEntry {
    double key;
    Song* song;
};

class BTreeNode {
public:
    bool leaf;
    vector<BTreeEntry> keys;
    vector<BTreeNode*> children;

    BTreeNode(bool isLeaf) {
        leaf = isLeaf;
    }
};

class BTree {
private:
    BTreeNode* root;
    int degree;

    void splitChild(BTreeNode* parent, int index);
    void insertNonFull(BTreeNode* node, BTreeEntry entry);
    void rangeSearch(BTreeNode* node, double minValue, double maxValue, vector<Song*>& results);

public:
    BTree(int degreeValue = 3);

    // Inserts one song by a numeric feature
    void insert(double key, Song* song);

    // Finds songs in a numeric range
    vector<Song*> searchRange(double minValue, double maxValue);
};

#endif
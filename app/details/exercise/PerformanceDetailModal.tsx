import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { PerformanceStorage } from '../../services/storage';
import { theme } from '../../theme/theme';
import { Performance, PerformanceSet } from '../../types';

interface PerformanceDetailModalProps {
  visible: boolean;
  performance: Performance | null;
  onClose: () => void;
  onSave?: (updatedPerformance: Performance) => void;
  onRefresh?: () => void;
}

export default function PerformanceDetailModal({
  visible,
  performance,
  onClose,
  onSave,
  onRefresh
}: PerformanceDetailModalProps) {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSet, setEditingSet] = useState<PerformanceSet | null>(null);
  const [editingSetIndex, setEditingSetIndex] = useState<number>(-1);
  const [editReps, setEditReps] = useState('');
  const [editWeight, setEditWeight] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditSet = (set: PerformanceSet, index: number) => {
    setEditingSet(set);
    setEditingSetIndex(index);
    setEditReps(set.reps.toString());
    setEditWeight(set.weight?.toString() || '');
    setEditModalVisible(true);
  };

  const handleSaveSet = async () => {
    if (!editingSet || editingSetIndex === -1 || !performance) return;

    const updatedSets = [...performance.sets];
    updatedSets[editingSetIndex] = {
      ...editingSet,
      reps: parseInt(editReps) || editingSet.reps,
      weight: editWeight ? parseFloat(editWeight) : undefined,
    };

    const updatedPerformance: Performance = {
      ...performance,
      sets: updatedSets,
    };

    try {
      setLoading(true);
      setError(null);
      
      // Storage'a kaydet
      await PerformanceStorage.updatePerformance(performance.id, updatedPerformance);

      Alert.alert(
        'Başarılı',
        'Performans başarıyla güncellendi.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              onSave?.(updatedPerformance);
              onRefresh?.();
              handleCancelEdit();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Performans güncelleme hatası:', error);
      setError('Performans güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingSet(null);
    setEditingSetIndex(-1);
    setEditReps('');
    setEditWeight('');
  };

  const handleDeleteSet = async (index: number) => {
    if (!performance) return;

    Alert.alert(
      'Set Sil',
      'Bu seti silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedSets = performance.sets.filter((_, i) => i !== index);
              const updatedPerformance: Performance = {
                ...performance,
                sets: updatedSets,
              };

              await PerformanceStorage.updatePerformance(performance.id, updatedPerformance);
              onSave?.(updatedPerformance);
              onRefresh?.();
            } catch (error) {
              console.error('Set silme hatası:', error);
              setError('Set silinirken hata oluştu');
            }
          }
        }
      ]
    );
  };

  if (!performance) return null;

  return (
    <>
      {/* Ana Modal */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Performans Detayı</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Content */}
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Exercise Info */}
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{performance.exerciseName}</Text>
                <Text style={styles.exerciseDate}>
                  {new Date(performance.date).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </Text>
              </View>

              {/* Sets */}
              <View style={styles.setsContainer}>
                <Text style={styles.setsTitle}>Setler</Text>
                {performance.sets.map((set, index) => (
                  <View key={index} style={styles.setRow}>
                    <View style={styles.setInfo}>
                      <Text style={styles.setNumber}>Set {index + 1}</Text>
                      <Text style={styles.setDetails}>
                        {set.reps} Reps
                        {set.weight && ` • ${set.weight} kg`}
                      </Text>
                    </View>
                    <View style={styles.setActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditSet(set, index)}
                      >
                        <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteSet(index)}
                      >
                        <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Notes */}
              {performance.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesTitle}>Notlar</Text>
                  <Text style={styles.notesText}>{performance.notes}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Set Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Düzenle</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleCancelEdit}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tekrar Sayısı</Text>
                <TextInput
                  style={styles.textInput}
                  value={editReps}
                  onChangeText={setEditReps}
                  keyboardType="numeric"
                  placeholder="Örn: 10"
                  placeholderTextColor={theme.colors.subtext}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ağırlık (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editWeight}
                  onChangeText={setEditWeight}
                  keyboardType="numeric"
                  placeholder="Opsiyonel"
                  placeholderTextColor={theme.colors.subtext}
                />
              </View>

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.cancelEditButton}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.cancelEditButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveEditButton, loading && styles.saveEditButtonDisabled]}
                  onPress={handleSaveSet}
                  disabled={loading}
                >
                  <Text style={styles.saveEditButtonText}>
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  errorContainer: {
    backgroundColor: theme.colors.danger,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  exerciseInfo: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  exerciseName: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseDate: {
    color: theme.colors.subtext,
    fontSize: 16,
  },
  setsContainer: {
    marginBottom: 24,
  },
  setsTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  setInfo: {
    flex: 1,
  },
  setNumber: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  setDetails: {
    color: theme.colors.subtext,
    fontSize: 14,
  },
  setActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  notesText: {
    color: theme.colors.subtext,
    fontSize: 16,
    lineHeight: 24,
  },
  editForm: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: 16,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelEditButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelEditButtonText: {
    color: theme.colors.subtext,
    fontSize: 16,
    fontWeight: '600',
  },
  saveEditButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveEditButtonText: {
    color: theme.colors.primaryOn,
    fontSize: 16,
    fontWeight: '600',
  },
  saveEditButtonDisabled: {
    opacity: 0.7,
  },
});

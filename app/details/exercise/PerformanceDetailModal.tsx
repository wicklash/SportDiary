import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { showConfirmAlert, showSuccessAlert, useCustomAlert } from '../../hooks';
import { PerformanceStorage } from '../../services/storage';
import { theme } from '../../theme/theme';
import { Performance, PerformanceSet } from '../../types/index';

interface PerformanceDetailModalProps {
  visible: boolean;
  performance: Performance | null;
  onClose: () => void;
  onSave?: (updatedPerformance: Performance) => void;
}

export default function PerformanceDetailModal({
  visible,
  performance,
  onClose,
  onSave
}: PerformanceDetailModalProps) {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSet, setEditingSet] = useState<PerformanceSet | null>(null);
  const [editingSetIndex, setEditingSetIndex] = useState<number>(-1);
  const [editReps, setEditReps] = useState('');
  const [editWeight, setEditWeight] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { showAlert, AlertComponent } = useCustomAlert();

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

      showSuccessAlert(showAlert, 'Performans başarıyla güncellendi.');
      onSave?.(updatedPerformance);
      handleCancelEdit();
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

    showConfirmAlert(
      showAlert,
      'Set Sil',
      'Bu seti silmek istediğinize emin misiniz?',
      async () => {
        try {
          const updatedSets = performance.sets.filter((_, i) => i !== index);
          const updatedPerformance: Performance = {
            ...performance,
            sets: updatedSets,
          };

          await PerformanceStorage.updatePerformance(performance.id, updatedPerformance);
          onSave?.(updatedPerformance);
        } catch (error) {
          console.error('Set silme hatası:', error);
          setError('Set silinirken hata oluştu');
        }
      }
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
              <View style={styles.headerContent}>
                <View style={styles.headerIcon}>
                  <Ionicons name="analytics" size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.modalTitle}>Performans Detayı</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.colors.subtext} />
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
              {/* Exercise Info Card */}
              <View style={styles.exerciseCard}>
                <View style={styles.exerciseIconContainer}>
                  <Ionicons name="barbell" size={32} color={theme.colors.primary} />
                </View>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseName}>{performance.exerciseName}</Text>
                  <View style={styles.dateContainer}>
                    <Ionicons name="time" size={16} color={theme.colors.subtext} />
                    <Text style={styles.exerciseDate}>
                      {new Date(performance.date).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Program & Day Info Card */}
              {(performance.programName || performance.dayName) && (
                <View style={styles.programCard}>
                  <View style={styles.programCardHeader}>
                    <View style={styles.programIconContainer}>
                      <Ionicons name="fitness" size={20} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.programCardTitle}>Program Bilgileri</Text>
                  </View>
                  <View style={styles.programCardContent}>
                    <View style={styles.programInfoItem}>
                      <View style={styles.programInfoIcon}>
                        <Ionicons name="folder" size={18} color={theme.colors.secondary} />
                      </View>
                      <View style={styles.programInfoContent}>
                        <Text style={styles.programInfoLabel}>Program</Text>
                        <Text style={styles.programInfoValue}>
                          {performance.programName || 'Bilinmeyen Program'}
                        </Text>
                      </View>
                    </View>
                    {performance.dayName && (
                      <View style={styles.programInfoItem}>
                        <View style={styles.programInfoIcon}>
                          <Ionicons name="calendar" size={18} color={theme.colors.secondary} />
                        </View>
                        <View style={styles.programInfoContent}>
                          <Text style={styles.programInfoLabel}>Gün</Text>
                          <Text style={styles.programInfoValue}>
                            {performance.dayName}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Sets Card */}
              <View style={styles.setsCard}>
                <View style={styles.setsHeader}>
                  <View style={styles.setsIconContainer}>
                    <Ionicons name="list" size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.setsTitle}>Setler</Text>
                  <View style={styles.setsSummary}>
                    <Text style={styles.setsSummaryText}>{performance.sets.length} Set</Text>
                  </View>
                </View>
                <View style={styles.setsContent}>
                  {performance.sets.map((set, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.setItem}
                      onPress={() => handleEditSet(set, index)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.setNumberContainer}>
                        <Text style={styles.setNumber}>{index + 1}</Text>
                      </View>
                      <View style={styles.setInfo}>
                        <View style={styles.setMetrics}>
                          <View style={styles.setMetric}>
                            <Ionicons name="refresh" size={14} color={theme.colors.subtext} />
                            <Text style={styles.setMetricText}>{set.reps} Reps</Text>
                          </View>
                          {set.weight && (
                            <View style={styles.setMetric}>
                              <Ionicons name="barbell" size={14} color={theme.colors.subtext} />
                              <Text style={styles.setMetricText}>{set.weight} kg</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={styles.setActions}>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteSet(index);
                          }}
                        >
                          <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes Card */}
              {performance.notes && (
                <View style={styles.notesCard}>
                  <View style={styles.notesHeader}>
                    <View style={styles.notesIconContainer}>
                      <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.notesTitle}>Notlar</Text>
                  </View>
                  <View style={styles.notesContent}>
                    <Text style={styles.notesText}>{performance.notes}</Text>
                  </View>
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
      
      {/* Custom Alert */}
      <AlertComponent />
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
    paddingVertical: 20,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
  exerciseCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseDate: {
    color: theme.colors.subtext,
    fontSize: 14,
  },
  programCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  programCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  programIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  programCardTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  programCardContent: {
    padding: 16,
  },
  programInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  programInfoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  programInfoContent: {
    flex: 1,
  },
  programInfoLabel: {
    color: theme.colors.subtext,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  programInfoValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  setsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  setsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  setsTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  setsSummary: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  setsSummaryText: {
    color: theme.colors.subtext,
    fontSize: 12,
    fontWeight: '500',
  },
  setsContent: {
    padding: 16,
  },
  setItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  setNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  setNumber: {
    color: theme.colors.primaryOn,
    fontSize: 14,
    fontWeight: 'bold',
  },
  setInfo: {
    flex: 1,
  },
  setMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  setMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  setMetricText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  setActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.danger}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  notesIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notesTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  notesContent: {
    padding: 16,
  },
  notesText: {
    color: theme.colors.subtext,
    fontSize: 15,
    lineHeight: 22,
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

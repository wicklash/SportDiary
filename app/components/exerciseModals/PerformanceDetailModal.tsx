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
      const result = await PerformanceStorage.updatePerformance(performance.id, updatedPerformance);

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

  const handleDeletePerformance = async () => {
    if (!performance) return;

    Alert.alert(
      'Performansı Sil',
      'Bu performans kaydını silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              setError(null);
              
              const result = await PerformanceStorage.deletePerformance(performance.id);
              
              Alert.alert(
                'Başarılı',
                'Performans kaydı silindi.',
                [
                  {
                    text: 'Tamam',
                    onPress: () => {
                      onRefresh?.();
                      onClose();
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Performans silme hatası:', error);
              setError('Performans silinirken hata oluştu');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (!performance) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Performans Detayları</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[styles.deleteButton, loading && styles.deleteButtonDisabled]} 
                onPress={handleDeletePerformance}
                disabled={loading}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Tarih ve Saat */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Tarih & Saat</Text>
              </View>
              <Text style={styles.primaryText}>
                {new Date(performance.date).toLocaleDateString('tr-TR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
              <Text style={styles.secondaryText}>
                {new Date(performance.date).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>

            {/* Program ve Gün Bilgileri */}
            {(performance.programName || performance.dayName) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="fitness" size={20} color={theme.colors.primary} />
                  <Text style={styles.sectionTitle}>Antrenman Bilgileri</Text>
                </View>
                {performance.programName && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Program:</Text>
                    <Text style={styles.value}>{performance.programName}</Text>
                  </View>
                )}
                {performance.dayName && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Gün:</Text>
                    <Text style={styles.value}>{performance.dayName}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Set Detayları */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="barbell" size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Set Detayları</Text>
              </View>
              {performance.sets.map((set, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.setItem}
                  onPress={() => handleEditSet(set, index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.setNumber}>
                    <Text style={styles.setNumberText}>{set.setNumber}</Text>
                  </View>
                  <View style={styles.setDetails}>
                    <Text style={styles.setText}>
                      {set.reps} tekrar
                      {set.weight && ` × ${set.weight} kg`}
                    </Text>
                    <View style={styles.setActions}>
                      {set.completed && (
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                      )}
                      <Ionicons name="create-outline" size={16} color={theme.colors.primary} style={{ marginLeft: 8 }} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notlar */}
            {performance.notes && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                  <Text style={styles.sectionTitle}>Notlar</Text>
                </View>
                <View style={styles.notesContainer}>
                  <Text style={styles.notesText}>{performance.notes}</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Set Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Set Düzenle</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleCancelEdit}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            {editingSet && (
              <View style={styles.editForm}>
                <Text style={styles.editSetTitle}>Set {editingSet.setNumber}</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tekrar Sayısı</Text>
                  <TextInput
                    style={styles.input}
                    value={editReps}
                    onChangeText={setEditReps}
                    keyboardType="numeric"
                    placeholder="Tekrar sayısını girin"
                    placeholderTextColor={theme.colors.subtext}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ağırlık (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={editWeight}
                    onChangeText={setEditWeight}
                    keyboardType="numeric"
                    placeholder="Ağırlığı girin (opsiyonel)"
                    placeholderTextColor={theme.colors.subtext}
                  />
                </View>
                
                <View style={styles.editButtonRow}>
                  <TouchableOpacity 
                    style={[styles.editButton, styles.cancelButton]} 
                    onPress={handleCancelEdit}
                  >
                    <Text style={styles.cancelButtonText}>İptal</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.editButton, styles.saveButton]} 
                    onPress={handleSaveSet}
                  >
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingTop: 8,
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
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginRight: 10,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  secondaryText: {
    color: theme.colors.subtext,
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    color: theme.colors.subtext,
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  setItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  setNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  setNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  setDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  notesContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notesText: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  // Edit Modal Styles
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  editModalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  editModalTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  editForm: {
    padding: 20,
  },
  editSetTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  editButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
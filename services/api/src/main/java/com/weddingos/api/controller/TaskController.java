package com.weddingos.api.controller;

import com.weddingos.api.model.PreparationTask;
import com.weddingos.api.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
@Tag(name = "Preparation Tasks", description = "Endpoints for managing organizer tasks, kanban statuses, categories and assignments")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    @Operation(summary = "Get preparation tasks with optional category or status filters")
    public ResponseEntity<List<PreparationTask>> getTasks(
            @RequestParam(defaultValue = "1") Long weddingId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) PreparationTask.Status status) {
        return ResponseEntity.ok(taskService.getTasks(weddingId, category, status));
    }

    @PostMapping
    @Operation(summary = "Create a new preparation task")
    public ResponseEntity<PreparationTask> createTask(
            @RequestParam(defaultValue = "1") Long weddingId,
            @RequestBody PreparationTask task) {
        return ResponseEntity.ok(taskService.createTask(weddingId, task));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle task completion state (TODO <-> COMPLETED)")
    public ResponseEntity<PreparationTask> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.toggleStatus(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update task details")
    public ResponseEntity<PreparationTask> updateTask(@PathVariable Long id, @RequestBody PreparationTask task) {
        return ResponseEntity.ok(taskService.updateTask(id, task));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete task")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
